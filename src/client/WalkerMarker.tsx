import { atom, useAtomValue, useSetAtom, useStore } from "jotai"
import { findLast, last, throttle } from "lodash-es"
import { User2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Marker } from "react-map-gl"
import { DEFAULT_LOCATION } from "~/config"
import { api, type RouterInputs } from "~/utils/api"
import { calcNavigationAtom } from "./WalkerRoute"
import { usePlayer } from "./usePlayer"

export const playerLocationAtom = atom({
  lat: DEFAULT_LOCATION.lat,
  lng: DEFAULT_LOCATION.lng,
})

export const WalkerMarker = () => {
  const store = useStore()
  const result = useAtomValue(calcNavigationAtom)
  const setPlayerLocation = useSetAtom(playerLocationAtom)

  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const frameRef = useRef<number | undefined>()

  const { player } = usePlayer()
  const { mutate: move } = api.player.move.useMutation()

  const moveThrottled = useMemo(
    () =>
      throttle((input: RouterInputs["player"]["move"]) => {
        move(input)
      }, 1000),
    [move]
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

    if (player) {
      moveThrottled({
        playerId: player?.id,
        lat,
        lng,
      })
    }

    frameRef.current = requestAnimationFrame(animateMarker)
  }, [moveThrottled, player, result?.timingLegs, setPlayerLocation, store])

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
      >
        <div className="relative aspect-square rounded-full border-2 bg-blue-500 ring-2 ring-blue-400">
          <User2 size={24} className="animate text-white" />
          <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-blue-400" />
        </div>
      </Marker>
    </>
  )
}
