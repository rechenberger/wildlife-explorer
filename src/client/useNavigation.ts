import { atom, useSetAtom, useStore } from "jotai"
import { useCallback } from "react"
import { playerLocationAtom } from "./WalkerMarker"
import { calcNavigationAtom } from "./WalkerRoute"
import { usePlayer } from "./usePlayer"

export const navigatingToObservationIdAtom = atom<number | null>(null)
export const isNavigatingAtom = atom(false)
export const navigationEtaAtom = atom<Date | null>(null)
export const navigationDistanceInMeterAtom = atom(0)

export const useNavigation = () => {
  const store = useStore()
  const calcNavigation = useSetAtom(calcNavigationAtom)
  const setObservationId = useSetAtom(navigatingToObservationIdAtom)
  const setIsNavigating = useSetAtom(isNavigatingAtom)
  const setNavigationEta = useSetAtom(navigationEtaAtom)
  const { playerId } = usePlayer()

  const navigate = useCallback(
    async ({
      lat,
      lng,
      observationId,
    }: {
      lat: number
      lng: number
      observationId?: number
    }) => {
      if (!playerId) return
      setObservationId(observationId || null)
      const navigation = await calcNavigation([
        {
          from: store.get(playerLocationAtom),
          to: {
            lat,
            lng,
          },
          playerId,
        },
      ])

      setIsNavigating(true)
      setNavigationEta(navigation.eta)
    },
    [
      calcNavigation,
      playerId,
      setIsNavigating,
      setNavigationEta,
      setObservationId,
      store,
    ]
  )

  return { navigate }
}
