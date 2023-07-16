import { useStore } from "jotai"
import { useEffect, useRef } from "react"
import { playerLocationAtom } from "./PlayerMarker"
import { useMapFlyTo, useMapRef } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const MapControls = () => {
  const mapRef = useMapRef()
  const store = useStore()
  const mapFlyTo = useMapFlyTo()

  // Goto player coords when pressing Space
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        const playerLocation = store.get(playerLocationAtom)
        mapFlyTo({ center: playerLocation })
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mapRef, mapFlyTo, store])

  const initialCenteringRef = useRef(false)
  const { player } = usePlayer()
  useEffect(() => {
    if (!player) return
    if (initialCenteringRef.current) return
    initialCenteringRef.current = true
    mapFlyTo({ center: player, zoom: 10, pitch: 45 })
  }, [mapFlyTo, mapRef, player])

  return <></>
}
