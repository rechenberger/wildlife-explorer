import { atom, useAtom, useAtomValue, useStore } from "jotai"
import { Navigation } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { DEFAULT_MAP_PITCH, DEFAULT_MAP_ZOOM } from "~/config"
import { calcDistanceInMeter } from "~/server/lib/latLng"
import { mapStateAtom } from "./MapBase"
import { playerLocationAtom } from "./PlayerMarker"
import { Button } from "./shadcn/ui/button"
import { useActiveNavigation } from "./useActiveNavigation"
import { useKeyboardShortcut } from "./useKeyboardShortcut"
import { useMapFlyTo, useMapRef } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const stickToPlayerAtom = atom(true)

const distanceAwayFromPlayerAtom = atom((get) => {
  const playerLocation = get(playerLocationAtom)
  const mapState = get(mapStateAtom)
  if (!playerLocation) return
  if (!mapState) return
  const distance = calcDistanceInMeter(playerLocation, mapState)
  return distance
})

export const MainNavigationButton = () => {
  const [stickToPlayer, setStickToPlayer] = useAtom(stickToPlayerAtom)

  const mapRef = useMapRef()
  const store = useStore()
  const mapFlyTo = useMapFlyTo()

  // Goto player
  const gotoPlayer = useCallback(
    ({ instant }: { instant?: boolean } = {}) => {
      const playerLocation = store.get(playerLocationAtom)
      mapFlyTo({
        center: playerLocation,
        zoom: DEFAULT_MAP_ZOOM,
        pitch: DEFAULT_MAP_PITCH,
        instant,
      })
      setStickToPlayer(true)
    },
    [mapFlyTo, setStickToPlayer, store]
  )
  useKeyboardShortcut("GOTO_PLAYER", () => gotoPlayer())

  // Goto player initially
  const initialCenteringRef = useRef(false)
  const { player } = usePlayer()
  useEffect(() => {
    if (!player) return
    if (initialCenteringRef.current) return
    initialCenteringRef.current = true
    gotoPlayer()
  }, [gotoPlayer, player])

  const finish = player?.metadata?.navigation?.finish
  const { isNavigating } = useActiveNavigation()
  const playerLocation = useAtomValue(playerLocationAtom)
  useEffect(() => {
    if (!finish) return
    if (!stickToPlayer) return
    if (!mapRef.current) return
    if (!playerLocation) return
    if (isNavigating) {
      mapRef.current.fitBounds([playerLocation, finish], {
        maxZoom: DEFAULT_MAP_ZOOM,
        duration: 0,
        pitch: DEFAULT_MAP_PITCH,
        padding: 200,
      })
    } else {
      gotoPlayer({ instant: false })
    }
  }, [finish, gotoPlayer, isNavigating, mapRef, playerLocation, stickToPlayer])

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
