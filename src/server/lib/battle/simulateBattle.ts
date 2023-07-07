import { Battle, toID, type PokemonSet, type SideID } from "@pkmn/sim"
import { type PrismaClient } from "@prisma/client"
import { map } from "lodash-es"
import { createSeed } from "~/utils/seed"
import { getBattleForSimulation } from "./getBattleForSimulation"
import { getWildlifeFighter } from "./getWildlifeFighter"

export const simulateBattle = async ({
  prisma,
  battleId,
}: {
  prisma: PrismaClient
  battleId: string
}) => {
  const battleDb = await getBattleForSimulation({
    prisma,
    battleId,
  })

  const battle = new Battle({
    formatid: toID("gen7randombattle"),
    seed: [13103, 5088, 17178, 48392], // TODO:
  })

  const teams = map(battleDb.battleParticipants, (battleParticipant, idx) => {
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
      team = battleParticipant.player?.catches.map((c) => {
        return {
          fighter: getWildlifeFighter({
            wildlife: c.wildlife,
            isCaught: true,
            seed: c.seed,
            locale: "de",
          }),
          wildlife: c.wildlife,
          catch: c,
        }
      })
    } else if (!!battleParticipant.wildlife) {
      team = [
        {
          fighter: getWildlifeFighter({
            wildlife: battleParticipant.wildlife,
            isCaught: false,
            seed: createSeed(battleParticipant.wildlife),
            locale: "de",
          }),
          wildlife: battleParticipant.wildlife,
        },
      ]
    }

    battle.setPlayer(sideId, {
      name,
      team: team.map((t) => t.fighter),
    })

    return {
      sideId,
      name,
      team,
      player: battleParticipant.player,
    }
  })

  const betterOutput = () => {
    return {
      winner: battle.winner,
      sides: battle.sides.map((side, sideIdx) => {
        const team = teams[sideIdx]!
        const fighters = side.pokemon.map((p, fighterIdx) => {
          const fighter = team.team[fighterIdx]!
          return {
            ...fighter,
            fighterStatus: {
              name: p.name,
              hp: p.hp,
              hpMax: p.maxhp,
              status: p.status,
              isActive: p.isActive,
            },
          }
        })
        return { name: team.name, fighters, player: team.player }
      }),
    }
  }

  // console.log(betterOutput())
  battle.choose("p1", "move 1")
  battle.choose("p2", "move 2")
  console.log(betterOutput())

  // const winner = battle.winner

  // console.log(battle.log)

  // console.log(battle.log)
  // console.log(JSON.stringify(battle.toJSON(), null, 2))

  return betterOutput()
}
