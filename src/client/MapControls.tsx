import { useStore } from "jotai"
import { useEffect, useRef } from "react"
import { playerLocationAtom } from "./PlayerMarker"
import { useMapRef } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const MapControls = () => {
  const mapRef = useMapRef()
  const store = useStore()

  // Goto player coords when pressing Space
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        const playerLocation = store.get(playerLocationAtom)
        // mapRef.current?.setCenter(playerLocation)
        mapRef.current?.flyTo({ center: playerLocation })
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mapRef, store])

  const initialCenteringRef = useRef(false)
  const { player } = usePlayer()
  useEffect(() => {
    if (!player) return
    if (initialCenteringRef.current) return
    initialCenteringRef.current = true
    // mapRef.current?.setCenter({ lat: player?.lat, lng: player?.lng })
    mapRef.current?.flyTo({ center: player, zoom: 10, pitch: 45 })
  }, [mapRef, player])

  return <></>
}
