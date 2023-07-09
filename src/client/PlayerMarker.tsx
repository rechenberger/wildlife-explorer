import { atom, useSetAtom, useStore } from "jotai"
import { User2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Marker } from "react-map-gl"
import { DEFAULT_LOCATION } from "~/config"
import {
  calcCurrentLocation,
  calcTimingLegs,
} from "~/server/lib/calcTimingLegs"
import { type RouterOutputs } from "~/utils/api"
import { otherPlayersLocationAtom } from "./OtherPlayers"
import { cn } from "./cn"

export const playerLocationAtom = atom({
  lat: DEFAULT_LOCATION.lat,
  lng: DEFAULT_LOCATION.lng,
})

type Player =
  | RouterOutputs["player"]["getMe"]
  | RouterOutputs["player"]["others"][number]

export const PlayerMarker = ({
  player,
  isMe,
}: {
  player: Player
  isMe?: boolean
}) => {
  const store = useStore()
  const setPlayerLocation = useSetAtom(playerLocationAtom)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const frameRef = useRef<number | undefined>()

  const result = useMemo(
    () =>
      player?.metadata?.navigation
        ? calcTimingLegs(player?.metadata?.navigation)
        : null,
    [player?.metadata?.navigation]
  )

  const animateMarker = useCallback(() => {
    if (!markerRef.current) return

    const currentLocation = result?.timingLegs
      ? calcCurrentLocation({
          timingLegs: result?.timingLegs,
        })
      : null

    if (!currentLocation) {
      return
    }

    markerRef.current.setLngLat(currentLocation)
    if (isMe) {
      setPlayerLocation(currentLocation)
    } else {
      store.set(otherPlayersLocationAtom, (dict) => ({
        ...dict,
        [player.id]: currentLocation,
      }))
    }

    frameRef.current = requestAnimationFrame(animateMarker)
  }, [isMe, player.id, result?.timingLegs, setPlayerLocation, store])

  useEffect(() => {
    animateMarker()
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [animateMarker])

  return (
    <>
      <Marker
        ref={markerRef}
        latitude={player.lat}
        longitude={player.lng}
        anchor="center"
        style={{
          zIndex: isMe ? 30 : 25,
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "relative aspect-square rounded-full border-2  ring-2",
              isMe
                ? "bg-blue-500 ring-blue-400"
                : "bg-purple-500 ring-purple-400"
            )}
          >
            <User2 size={24} className="animate text-white" />
            <div
              className={cn(
                "absolute inset-0 animate-ping rounded-full ring-2",
                isMe ? "ring-blue-400" : "ring-purple-400"
              )}
            />
          </div>
          <div
            className={cn(
              "line-clamp-1 flex items-center overflow-visible whitespace-nowrap text-center",
              isMe ? "text-blue-500" : "text-purple-500"
            )}
          >
            {player.name}
          </div>
        </div>
      </Marker>
    </>
  )
}
