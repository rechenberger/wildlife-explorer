import {
  Battle,
  extractChannelMessages,
  toID,
  type PokemonSet,
  type SideID,
} from "@pkmn/sim"
import { findIndex, first, map } from "lodash-es"
import {
  BATTLE_INPUT_VERSION,
  BATTLE_REPORT_VERSION,
  MAX_FIGHTERS_PER_TEAM,
} from "~/config"
import { type MyPrismaClient } from "~/server/db"
import { createSeed, rngInt } from "~/utils/seed"
import {
  BattleReport,
  type BattleReportFighter,
  type BattleReportSide,
} from "./BattleReport"
import {
  getBattleForSimulation,
  type BattleInput,
} from "./getBattleForSimulation"
import { getWildlifeFighter } from "./getWildlifeFighter"
import { transformWildlifeFighterPlus } from "./getWildlifeFighterPlus"

export const simulateBattle = async ({
  prisma,
  battleId,
  choice,
  battleInput,
  battleJson,
}: {
  prisma: MyPrismaClient
  battleId: string
  choice?: {
    playerId: string
    choice: string
  }
  battleInput?: BattleInput
  battleJson?: any
}) => {
  if (!battleInput || battleInput.version !== BATTLE_INPUT_VERSION) {
    console.time("getBattleForSimulation")
    battleInput = await getBattleForSimulation({
      prisma,
      battleId,
      playerPartyLimit: MAX_FIGHTERS_PER_TEAM,
    })
    console.timeEnd("getBattleForSimulation")
  }
  if (!battleInput) throw new Error("No battleInput")

  const playerParticipations = battleInput.battleParticipants.flatMap(
    (bp, participantIdx) =>
      bp.player?.id
        ? [
            {
              playerId: bp.player.id,
              participantIdx,
            },
          ]
        : []
  )

  console.time("simulateBattle")

  // INIT BATTLE
  let battle: Battle
  if (battleJson) {
    battle = Battle.fromJSON(battleJson)
  } else {
    battle = new Battle({
      formatid: toID("gen7randombattle"),
      // formatid: toID("doubles"),
      seed: [13103, 5088, 17178, 48392], // TODO:
    })
  }

  // BUILD TEAMS
  const teams = await Promise.all(
    map(battleInput.battleParticipants, async (battleParticipant, idx) => {
      if (idx > 4) throw new Error("Too many participants!")
      const sideId = `p${idx + 1}` as SideID
      const name =
        battleParticipant.player?.name ??
        // battleParticipant.wildlife?.metadata.taxonCommonName ??
        "Wildlife"

      let team: {
        fighter: PokemonSet
        wildlife: Omit<
          NonNullable<typeof battleParticipant.wildlife>,
          "observationId" | "respawnsAt"
        >
        catch?: NonNullable<typeof battleParticipant.player>["catches"][number]
      }[] = []

      if (!!battleParticipant.player?.catches) {
        team = await Promise.all(
          battleParticipant.player?.catches.map(async (c, idx) => {
            return {
              fighter: await getWildlifeFighter({
                ...c,
                idx,
              }),
              wildlife: c.wildlife,
              catch: c,
            }
          })
        )
      } else if (!!battleParticipant.wildlife) {
        team = [
          {
            fighter: await getWildlifeFighter({
              wildlife: battleParticipant.wildlife,
              seed: createSeed(battleParticipant.wildlife),
              idx: 0,
            }),
            wildlife: battleParticipant.wildlife,
          },
          // {
          //   fighter: getWildlifeFighter({
          //     wildlife: { ...battleParticipant.wildlife, id: "fake-2" },
          //     isCaught: false,
          //     seed: createSeed(battleParticipant.wildlife),
          //     locale: "de",
          //   }),
          //   wildlife: { ...battleParticipant.wildlife, id: "fake-2" },
          // },
        ]
      }

      if (!battleJson) {
        battle.setPlayer(sideId, {
          name,
          team: team.map((t) => t.fighter),
        })
      }

      return {
        sideId,
        name,
        team,
        player: battleParticipant.player,
        participationId: battleParticipant.id,
      }
    })
  )

  // CHOICE
  if (choice) {
    const participantIdx = findIndex(
      battleInput.battleParticipants,
      (p) => p.player?.id === choice.playerId
    )
    if (participantIdx === -1) {
      // SECURITY
      throw new Error(`Player not found: ${choice.playerId}`)
    }
    const sideId = `p${participantIdx + 1}` as SideID

    const success = battle.choose(sideId, choice.choice)
    if (!success) {
      throw new Error(`Invalid choice: "${choice.choice}"`)
    }

    const allPlayerChoicesDone = () =>
      playerParticipations.every((pc) => {
        const sideId = `p${pc.participantIdx + 1}` as SideID
        return battle[sideId]!.isChoiceDone()
      })

    if (allPlayerChoicesDone()) {
      // TODO: AI

      // CHOSE RANDOM MOVE:
      let choseOther = false
      const other = sideId === "p1" ? battle.p2 : battle.p1
      const otherFighter = first(other.active)
      const moves = otherFighter?.moves?.length
      if (moves) {
        const move = rngInt({
          seed: [...battle.prngSeed, battle.turn, "move"],
          min: 1,
          max: moves,
        })
        const success = other.choose(`move ${move}`)
        choseOther = success
      }
      if (!choseOther) {
        battle.makeChoices()
      }
    }
    // When player defeats wildlife, check if there are more wildlife to fight:
    if (allPlayerChoicesDone()) {
      // TODO: AI
      battle.makeChoices()
    }
  }

  // BATTLE REPORT
  const makeBattleReport = () => {
    const battlePlayerChoices = playerParticipations.map((p) => {
      const sideId = `p${p.participantIdx + 1}` as SideID
      const isChoiceDone = battle[sideId]!.isChoiceDone()
      return {
        ...p,
        isChoiceDone,
      }
    })
    const sides = battle.sides.map((side, sideIdx) => {
      const team = teams[sideIdx]!
      const fighters = side.pokemon.map((p) => {
        const idxInTeam = parseInt(p.name[1]!) - 1
        // console.log({ name: p.name, turns: p.activeTurns })

        const fighter = team.team[idxInTeam]

        const foe = first(p.foes())
        const foeTypes = foe?.types

        const fighterPlus = transformWildlifeFighterPlus({
          pokemon: p,
          pokemonSet: fighter!.fighter,
          foeTypes,
        })

        return {
          fighter: fighterPlus,
          name: fighter?.catch?.name,
          catch: fighter?.catch,
          wildlife: fighter!.wildlife,
          activeTurns: p.activeTurns,
          fainted: p.fainted,
        } satisfies BattleReportFighter
      })
      return {
        name: team.name,
        fighters,
        player: team.player,
        isWinner: battle.winner === side.name,
        participationId: team.participationId,
      } satisfies BattleReportSide
    })

    return {
      winner: battle.winner,
      // inputLog: battle.inputLog,

      // TODO: this assumes that we are always viewing as p1
      outputLog: extractChannelMessages(battle.log.join("\n"), [1])[1],
      battlePlayerChoices,

      sides,
      version: BATTLE_REPORT_VERSION,
    } satisfies BattleReport
  }

  // console.log(battle.log)
  // console.log(JSON.stringify(battle.toJSON(), null, 2))

  // const type = Dex.types.get("Fire")
  // const water = Dex.types.get("Water")
  // console.log(Dex.types.all())
  const battleReport = makeBattleReport()
  // console.log(battleReport)
  const result = {
    battleReport: BattleReport.parse(battleReport),
    battleJson: battle.toJSON(),
    battleInput,
  }
  console.timeEnd("simulateBattle")
  return result
}

export type BattleResult = Awaited<ReturnType<typeof simulateBattle>>
export type BattleJson = BattleResult["battleJson"]
