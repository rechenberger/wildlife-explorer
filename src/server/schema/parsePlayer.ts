import { type Player } from "../db"
import { calcPlayerCurrentLocation } from "../lib/calcTimingLegs"

export const parsePlayer = (player: Player) => {
  const currentLocation = calcPlayerCurrentLocation({ player })
  if (currentLocation) {
    player = {
      ...player,
      ...currentLocation,
    }
  }
  return player
}
