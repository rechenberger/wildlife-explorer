import { useStore } from "jotai"
import { useEffect } from "react"
import { playerLocationAtom } from "./PlayerMarker"
import { useMapRef } from "./useMapRef"

export const MapControls = () => {
  const mapRef = useMapRef()
  const store = useStore()

  // Goto player coords when pressing Space
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        const playerLocation = store.get(playerLocationAtom)
        mapRef.current?.setCenter(playerLocation)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mapRef, store])

  return <></>
}
