import { Battle, toID, type PokemonSet, type SideID } from "@pkmn/sim"
import { type PrismaClient } from "@prisma/client"
import { forEach } from "lodash-es"
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

  forEach(battleDb.battleParticipants, (battleParticipant, idx) => {
    if (idx > 4) throw new Error("Too many participants!")
    const sideId = `p${idx + 1}` as SideID
    const name =
      battleParticipant.player?.name ??
      battleParticipant.wildlife?.metadata.taxonCommonName ??
      "Unknown Player"

    let team: PokemonSet[] = []

    if (!!battleParticipant.player?.catches) {
      team = battleParticipant.player?.catches.map((c) => {
        return getWildlifeFighter({
          wildlife: c.wildlife,
          isCaught: true,
          seed: c.seed,
          locale: "de",
        })
      })
    } else if (!!battleParticipant.wildlife) {
      team = [
        getWildlifeFighter({
          wildlife: battleParticipant.wildlife,
          isCaught: false,
          seed: createSeed(battleParticipant.wildlife),
          locale: "de",
        }),
      ]
    }

    battle.setPlayer(sideId, {
      name,
      team,
    })
  })

  const betterOutput = () => {
    return {
      sides: battle.sides.map((side) => {
        const pokemon = side.pokemon.map((p) => ({
          name: p.name,
          hp: p.hp,
          maxhp: p.maxhp,
          status: p.status,
        }))
        return pokemon
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
