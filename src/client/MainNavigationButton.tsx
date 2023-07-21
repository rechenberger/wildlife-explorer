import { atom, useAtom, useStore } from "jotai"
import { useEffect, useRef } from "react"
import { playerLocationAtom } from "./PlayerMarker"
import { Button } from "./shadcn/ui/button"
import { useMapFlyTo, useMapRef } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const stickToPlayerAtom = atom(true)

export const MainNavigationButton = () => {
  const [stickToPlayer, setStickToPlayer] = useAtom(stickToPlayerAtom)

  const mapRef = useMapRef()
  const store = useStore()
  const mapFlyTo = useMapFlyTo()

  // Goto player coords when pressing Space
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        const playerLocation = store.get(playerLocationAtom)
        mapFlyTo({ center: playerLocation })
        setStickToPlayer(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mapRef, mapFlyTo, store, setStickToPlayer])

  // Goto player initially
  const initialCenteringRef = useRef(false)
  const { player } = usePlayer()
  useEffect(() => {
    if (!player) return
    if (initialCenteringRef.current) return
    initialCenteringRef.current = true
    mapFlyTo({ center: player, zoom: 14, pitch: 45 })
    setStickToPlayer(true)
  }, [mapFlyTo, mapRef, player, setStickToPlayer])

  if (stickToPlayer) return null

  return (
    <>
      <Button className="rounded-full">Navigate</Button>
    </>
  )
}
