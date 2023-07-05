import { atom, useSetAtom, useStore } from "jotai"
import { findLast, last } from "lodash-es"
import { User2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Marker } from "react-map-gl"
import { DEFAULT_LOCATION } from "~/config"
import { calcTimingLegs } from "~/server/lib/calcTimingLegs"
import {
  isNavigatingAtom,
  navigatingToObservationIdAtom,
  navigationEtaAtom,
} from "./useNavigation"
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

    let nextStep = findLast(result?.timingLegs, (leg) => {
      return leg.startingAtTimestamp < Date.now()
    })
    nextStep = nextStep || last(result?.timingLegs)

    if (!nextStep) {
      // const playerLocation = store.get(playerLocationAtom)
      // markerRef.current.setLngLat(playerLocation)
      return
    }

    // console.log(nextStep)
    const startingAtTimestamp = nextStep.startingAtTimestamp
    const durationInSeconds = nextStep.durationInSeconds
    const now = Date.now()
    let progress = (now - startingAtTimestamp) / (durationInSeconds * 1000)
    if (progress > 1) {
      // const playerLocation = store.get(playerLocationAtom)
      // markerRef.current.setLngLat(playerLocation)
      store.set(isNavigatingAtom, false)
      store.set(navigationEtaAtom, null)
      store.set(navigatingToObservationIdAtom, null)
      return
    }
    progress = Math.min(Math.max(progress, 0), 1)

    const lat =
      nextStep.from.lat + (nextStep.to.lat - nextStep.from.lat) * progress
    const lng =
      nextStep.from.lng + (nextStep.to.lng - nextStep.from.lng) * progress

    // TODO: find out when and why this happens
    if (isNaN(lat) || isNaN(lng)) {
      console.error("lat or lng is NaN", { lat, lng })
      return
    }

    markerRef.current.setLngLat({
      lat,
      lng,
    })

    setPlayerLocation({
      lat,
      lng,
    })

    frameRef.current = requestAnimationFrame(animateMarker)
  }, [result?.timingLegs, setPlayerLocation, store])

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
