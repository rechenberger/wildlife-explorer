import { atom, useAtom, useStore } from "jotai"
import { Navigation } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { DEFAULT_LOCATION, DEFAULT_MAP_PITCH, DEFAULT_MAP_ZOOM } from "~/config"
import { playerLocationAtom } from "./PlayerMarker"
import { Button } from "./shadcn/ui/button"
import { isNavigatingAtom } from "./useActiveNavigation"
import { useInterval } from "./useInterval"
import { useKeyboardShortcut } from "./useKeyboardShortcut"
import { useMapFlyTo, useMapRef } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const stickToPlayerAtom = atom(true)

export const MainNavigationButton = () => {
  const [stickToPlayer, setStickToPlayer] = useAtom(stickToPlayerAtom)

  const mapRef = useMapRef()
  const store = useStore()
  const mapFlyTo = useMapFlyTo()
  const { player } = usePlayer()

  // Goto player
  const gotoPlayer = useCallback(
    ({ instant }: { instant?: boolean } = {}) => {
      let center = store.get(playerLocationAtom)
      if (
        center.lat === DEFAULT_LOCATION.lat &&
        center.lng === DEFAULT_LOCATION.lng &&
        !!player
      ) {
        center = player
      }

      mapFlyTo({
        center,
        zoom: DEFAULT_MAP_ZOOM,
        pitch: DEFAULT_MAP_PITCH,
        instant,
      })
      setStickToPlayer(true)
    },
    [mapFlyTo, player, setStickToPlayer, store]
  )
  useKeyboardShortcut("GOTO_PLAYER", () => gotoPlayer())

  // Goto player initially
  const initialCenteringRef = useRef(false)
  useEffect(() => {
    if (!player) return
    if (initialCenteringRef.current) return
    initialCenteringRef.current = true
    gotoPlayer()
  }, [gotoPlayer, player])

  const finish = player?.metadata?.navigation?.finish
  useInterval(() => {
    if (!finish) return
    if (!stickToPlayer) return
    if (!mapRef.current) return
    const playerLocation = store.get(playerLocationAtom)
    const isNavigating = store.get(isNavigatingAtom)
    if (!playerLocation) return
    if (isNavigating) {
      mapRef.current.fitBounds([playerLocation, finish], {
        maxZoom: DEFAULT_MAP_ZOOM,
        duration: 100,
        pitch: DEFAULT_MAP_PITCH,
        padding: 200,
      })
    } else {
      // gotoPlayer({ instant: false })
    }
  }, 100)

  if (stickToPlayer) return null

  return (
    <>
      <Button
        className="rounded-full bg-blue-500 hover:bg-blue-600 gap-1"
        size="sm"
        onClick={() => gotoPlayer()}
      >
        <Navigation className="w-4 h-4" />
        <div className="flex-1">Center on Player</div>
        <div className="w-4 h-4" />
      </Button>
    </>
  )
}
