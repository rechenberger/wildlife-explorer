import { useAtomValue } from "jotai"
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

    const currentLatLng = markerRef.current.getLngLat()

    markerRef.current.setLngLat({
      lat: currentLatLng.lat + 0.0001,
      lng: currentLatLng.lng + 0.0001,
    }),
      (frameRef.current = requestAnimationFrame(animateMarker))
  }, [])

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
