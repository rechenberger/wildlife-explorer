import { Dex } from "@pkmn/dex"
import { Battle, toID, type PokemonSet, type SideID } from "@pkmn/sim"
import { type PrismaClient } from "@prisma/client"
import { findIndex, first, map } from "lodash-es"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { createSeed } from "~/utils/seed"
import { getBattleForSimulation } from "./getBattleForSimulation"
import { getWildlifeFighter } from "./getWildlifeFighter"

export const simulateBattle = async ({
  prisma,
  battleId,
  choice,
}: {
  prisma: PrismaClient
  battleId: string
  choice?: {
    playerId: string
    choice: string
  }
}) => {
  console.time("getBattleForSimulation")
  const battleDb = await getBattleForSimulation({
    prisma,
    battleId,
    playerPartyLimit: MAX_FIGHTERS_PER_TEAM,
  })
  console.timeEnd("getBattleForSimulation")

  console.time("simulateBattle")
  // INIT BATTLE
  const battleJson = battleDb.metadata.battleJson
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
    map(battleDb.battleParticipants, async (battleParticipant, idx) => {
      if (idx > 4) throw new Error("Too many participants!")
      const sideId = `p${idx + 1}` as SideID
      const name =
        battleParticipant.player?.name ??
        // battleParticipant.wildlife?.metadata.taxonCommonName ??
        "Wildlife"

      let team: {
        fighter: PokemonSet
        wildlife: NonNullable<typeof battleParticipant.wildlife>
        catch?: NonNullable<typeof battleParticipant.player>["catches"][number]
      }[] = []

      if (!!battleParticipant.player?.catches) {
        team = await Promise.all(
          battleParticipant.player?.catches.map(async (c) => {
            return {
              fighter: await getWildlifeFighter({
                wildlife: c.wildlife,
                isCaught: true,
                seed: c.seed,
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
              isCaught: false,
              seed: createSeed(battleParticipant.wildlife),
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
      }
    })
  )

  // CHOICE
  if (choice) {
    const participantIdx = findIndex(
      battleDb.battleParticipants,
      (p) => p.playerId === choice.playerId
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
    if (battle[sideId]!.isChoiceDone()) {
      // TODO: AI
      battle.makeChoices()
    }
    // When player defeats wildlife, check if there are more wildlife to fight:
    if (battle[sideId]!.isChoiceDone()) {
      // TODO: AI
      battle.makeChoices()
    }
  }

  // BATTLE STATUS
  const battleStatus = () => {
    return {
      winner: battle.winner,
      inputLog: battle.inputLog,
      // battleDb: battleDb,
      sides: battle.sides.map((side, sideIdx) => {
        const team = teams[sideIdx]!
        const fighters = side.pokemon.map((p) => {
          let fighter = team.team.find((f) => f.fighter.name === p.name)!
          // if (!fighter) {
          //   console.log(
          //     "FIGHTER NOT FOUND",
          //     p.name,
          //     map(team.team, "fighter.name")
          //   )
          //   fighter = team.team[idx]
          // }

          return {
            ...fighter!,
            fighterStatus: {
              name: p.name,
              hp: p.hp,
              hpMax: p.maxhp,
              status: p.status,
              isActive: p.isActive,
              justFainted:
                side.faintedThisTurn === p || side.faintedLastTurn === p,
              moves: p.moves.map((move) => {
                const data = p.getMoveData(move)
                const definition = Dex.moves.getByID(toID(data?.id))
                const moveType = definition.type
                const foe = first(p.foes())
                const foeTypes = foe?.types
                const immunity = foeTypes
                  ? Dex.getImmunity(moveType, foeTypes)
                  : null
                const effectiveness = foeTypes
                  ? Dex.getEffectiveness(moveType, foeTypes)
                  : null

                // console.log({
                //   moveType,
                //   foeTypes,
                //   effectiveness,
                //   immunity,
                // })

                return {
                  name: data?.move || move,
                  status: data,
                  definition,
                  effectiveness,
                  immunity,
                }
              }),
              lastMove: p.lastMove,
              lastDamage: p.lastDamage,
              ability: Dex.abilities.get(p.ability),
              types: p.types,
            },
          }
        })
        return { name: team.name, fighters, player: team.player }
      }),
    }
  }

  // console.log(battle.log)
  // console.log(JSON.stringify(battle.toJSON(), null, 2))

  // const type = Dex.types.get("Fire")
  // const water = Dex.types.get("Water")
  // console.log(Dex.types.all())

  const result = {
    battleStatus: battleStatus(),
    battleJson: battle.toJSON(),
    battleDb,
  }
  console.timeEnd("simulateBattle")
  return result
}
