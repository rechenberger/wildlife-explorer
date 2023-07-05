import { atom, useSetAtom, useStore } from "jotai"
import { User2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Marker } from "react-map-gl"
import { DEFAULT_LOCATION } from "~/config"
import {
  calcCurrentLocation,
  calcTimingLegs,
} from "~/server/lib/calcTimingLegs"
import { usePlayer } from "./usePlayer"

export const playerLocationAtom = atom({
  lat: DEFAULT_LOCATION.lat,
  lng: DEFAULT_LOCATION.lng,
})

export const WalkerMarker = () => {
  const store = useStore()
  const setPlayerLocation = useSetAtom(playerLocationAtom)

  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const frameRef = useRef<number | undefined>()

  const { player } = usePlayer()
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
    setPlayerLocation(currentLocation)

    frameRef.current = requestAnimationFrame(animateMarker)
  }, [result?.timingLegs, setPlayerLocation])

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
        latitude={store.get(playerLocationAtom).lat}
        longitude={store.get(playerLocationAtom).lng}
        anchor="center"
        style={{
          zIndex: 30,
        }}
      >
        <div className="relative aspect-square rounded-full border-2 bg-blue-500 ring-2 ring-blue-400">
          <User2 size={24} className="animate text-white" />
          <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-blue-400" />
        </div>
      </Marker>
    </>
  )
}
