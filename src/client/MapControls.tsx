import { useStore } from "jotai"
import { useEffect, useRef } from "react"
import { playerLocationAtom } from "./PlayerMarker"
import { useMapRef, useMapSetCenter } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const MapControls = () => {
  const mapRef = useMapRef()
  const store = useStore()
  const mapSetCenter = useMapSetCenter()

  // Goto player coords when pressing Space
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        const playerLocation = store.get(playerLocationAtom)
        mapSetCenter(playerLocation)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mapRef, mapSetCenter, store])

  const initialCenteringRef = useRef(false)
  const { player } = usePlayer()
  useEffect(() => {
    if (!player) return
    if (initialCenteringRef.current) return
    initialCenteringRef.current = true
    mapRef.current?.flyTo({ center: player, zoom: 10, pitch: 45 })
  }, [mapRef, player])

  return <></>
}
