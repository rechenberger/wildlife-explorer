import { useAtomValue } from "jotai"
import { findLast, last } from "lodash-es"
import { User2 } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { Marker } from "react-map-gl"
import { calcNavigationAtom } from "./Walker"

export const WalkerMarker = () => {
  const result = useAtomValue(calcNavigationAtom)

  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const frameRef = useRef<number | undefined>()

  const animateMarker = useCallback(() => {
    if (!markerRef.current) return

    let nextStep = findLast(result?.timingLegs, (leg) => {
      return leg.startingAtTimestamp < Date.now()
    })
    nextStep = nextStep || last(result?.timingLegs)

    if (!nextStep) return

    // console.log(nextStep)
    const startingAtTimestamp = nextStep.startingAtTimestamp
    const durationInSeconds = nextStep.durationInSeconds
    const now = Date.now()
    let progress = (now - startingAtTimestamp) / (durationInSeconds * 1000)
    progress = Math.min(Math.max(progress, 0), 1)

    const lat =
      nextStep.from.lat + (nextStep.to.lat - nextStep.from.lat) * progress
    const lng =
      nextStep.from.lng + (nextStep.to.lng - nextStep.from.lng) * progress

    markerRef.current.setLngLat({
      lat,
      lng,
    }),
      (frameRef.current = requestAnimationFrame(animateMarker))
  }, [result?.timingLegs])

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
        latitude={50.928435947011906}
        longitude={6.930087265110956}
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
