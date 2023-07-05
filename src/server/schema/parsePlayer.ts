import { type Player } from "@prisma/client"
import { calcPlayerCurrentLocation } from "../lib/calcTimingLegs"
import { PlayerMetadata } from "./PlayerMetadata"

export const parsePlayer = (playerRaw: Player) => {
  let player = {
    ...playerRaw,
    metadata: PlayerMetadata.parse(playerRaw.metadata ?? {}),
  }
  const currentLocation = calcPlayerCurrentLocation({ player })
  if (currentLocation) {
    player = {
      ...player,
      ...currentLocation,
    }
  }
  return player
}
