import { atom, useSetAtom, useStore } from "jotai"
import { useCallback } from "react"
import { playerLocationAtom } from "./WalkerMarker"
import { calcNavigationAtom } from "./WalkerRoute"

export const navigatingToObservationIdAtom = atom<number | null>(null)
export const isNavigatingAtom = atom(false)

export const useNavigation = () => {
  const store = useStore()
  const calcNavigation = useSetAtom(calcNavigationAtom)
  const setObservationId = useSetAtom(navigatingToObservationIdAtom)
  const setIsNavigating = useSetAtom(isNavigatingAtom)

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
      setObservationId(observationId || null)
      await calcNavigation([
        {
          from: store.get(playerLocationAtom),
          to: {
            lat,
            lng,
          },
        },
      ])
      setIsNavigating(true)
    },
    [calcNavigation, setObservationId, store]
  )

  return { navigate }
}
