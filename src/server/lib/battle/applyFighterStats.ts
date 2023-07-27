import { Dex } from "@pkmn/dex"
import { type Pokemon } from "@pkmn/sim"
import { find } from "lodash-es"
import { type CatchMetadata } from "~/server/schema/CatchMetadata"

export const applyFighterStats = ({
  p,
  catchMetadata,
}: {
  p: Pokemon
  catchMetadata?: Pick<CatchMetadata, "moves" | "hp">
}) => {
  // Fixing PP
  // @pkmn/sim boosts PP to max, so we need to deduct it back down
  p.moves.forEach((moveId) => {
    const def = Dex.moves.get(moveId)
    const maxpp = def?.pp
    const ppFromMetadata = find(catchMetadata?.moves, { id: moveId })?.pp
    const status = p.getMoveData(moveId)
    if (!status) {
      throw new Error("Move not found with getMoveData")
    }

    // actually change the maxpp instead of the current pp
    // TODO: check if this works :O
    status.maxpp = maxpp

    const ppStatus = status.pp
    let ppTarget = maxpp
    if (typeof ppFromMetadata === "number") {
      ppTarget = Math.min(ppFromMetadata, ppTarget)
    } else {
      ppTarget = Math.min(ppStatus, ppTarget)
    }
    const diff = ppStatus - ppTarget
    if (diff > 0) {
      p.deductPP(moveId, diff)
    }
    // console.log({
    //   id: moveId,
    //   maxpp,
    //   ppFromMetadata,
    //   ppStatus,
    //   ppTarget,
    //   diff,
    // })
  })

  // Setting HP
  if (typeof catchMetadata?.hp === "number") {
    p.hp = catchMetadata?.hp
    p.fainted = p.hp <= 0
  }
}
