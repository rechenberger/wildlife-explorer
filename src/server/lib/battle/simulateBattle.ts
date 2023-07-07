import { Battle, toID } from "@pkmn/sim"
import { type PrismaClient } from "@prisma/client"
import { getBattleForSimulation } from "./getBattleForSimulation"
import { charizard, pikachu } from "./predefinedTeam"

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

  battle.setPlayer("p1", {
    name: "Alice",
    team: [pikachu],
  })

  battle.setPlayer("p2", {
    name: "Bob",
    team: [charizard],
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
