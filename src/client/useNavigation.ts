import { atom, useSetAtom } from "jotai"
import { useCallback } from "react"
import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export const navigatingToObservationIdAtom = atom<number | null>(null)
export const isNavigatingAtom = atom(false)
export const navigationEtaAtom = atom<Date | null>(null)
export const navigationDistanceInMeterAtom = atom(0)

export const useNavigation = () => {
  const { mutateAsync: calcNavigation } =
    api.navigation.calcNavigation.useMutation()
  const setObservationId = useSetAtom(navigatingToObservationIdAtom)
  const setIsNavigating = useSetAtom(isNavigatingAtom)
  const setNavigationEta = useSetAtom(navigationEtaAtom)
  const { playerId } = usePlayer()
  const trpc = api.useContext()

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
      const navigation = await calcNavigation({
        to: {
          lat,
          lng,
        },
        playerId,
      })
      trpc.player.getMe.invalidate()

      setIsNavigating(true)
      setNavigationEta(navigation.eta)
    },
    [
      calcNavigation,
      playerId,
      setIsNavigating,
      setNavigationEta,
      setObservationId,
      trpc.player.getMe,
    ]
  )

  return { navigate }
}
