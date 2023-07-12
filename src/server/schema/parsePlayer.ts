import { type PlayerWithMetadata } from "../db"
import { calcPlayerCurrentLocation } from "../lib/calcTimingLegs"

export const parsePlayer = (player: PlayerWithMetadata) => {
  const currentLocation = calcPlayerCurrentLocation({ player })
  if (currentLocation) {
    player = {
      ...player,
      ...currentLocation,
    }
  }
  return player
}
