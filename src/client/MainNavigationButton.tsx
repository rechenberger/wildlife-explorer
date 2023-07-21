import { atom, useAtom, useStore } from "jotai"
import { Navigation } from "lucide-react"
import { useEffect, useRef } from "react"
import { DEFAULT_MAP_PITCH, DEFAULT_MAP_ZOOM } from "~/config"
import { playerLocationAtom } from "./PlayerMarker"
import { Button } from "./shadcn/ui/button"
import { useKeyboardShortcut } from "./useKeyboardShortcut"
import { useMapFlyTo, useMapRef } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const stickToPlayerAtom = atom(true)

export const MainNavigationButton = () => {
  const [stickToPlayer, setStickToPlayer] = useAtom(stickToPlayerAtom)

  const mapRef = useMapRef()
  const store = useStore()
  const mapFlyTo = useMapFlyTo()

  // Goto player
  const gotoPlayer = () => {
    const playerLocation = store.get(playerLocationAtom)
    mapFlyTo({
      center: playerLocation,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: DEFAULT_MAP_PITCH,
    })
    setStickToPlayer(true)
  }
  useKeyboardShortcut("GOTO_PLAYER", gotoPlayer)

  // Goto player initially
  const initialCenteringRef = useRef(false)
  const { player } = usePlayer()
  useEffect(() => {
    if (!player) return
    if (initialCenteringRef.current) return
    initialCenteringRef.current = true
    mapFlyTo({
      center: player,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: DEFAULT_MAP_PITCH,
    })
    setStickToPlayer(true)
  }, [mapFlyTo, mapRef, player, setStickToPlayer])

  if (stickToPlayer) return null

  return (
    <>
      <Button
        className="rounded-full bg-blue-500 hover:bg-blue-600 gap-1"
        size="sm"
        onClick={gotoPlayer}
      >
        <Navigation className="w-4 h-4" />
        <div className="flex-1">Center on Player</div>
        <div className="w-4 h-4" />
      </Button>
    </>
  )
}
