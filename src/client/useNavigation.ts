import { atom, useSetAtom } from "jotai"
import { useCallback } from "react"
import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export const navigatingToObservationIdAtom = atom<number | null>(null)

export const useNavigation = () => {
  const { mutateAsync: calcNavigation } =
    api.navigation.calcNavigation.useMutation()
  const setObservationId = useSetAtom(navigatingToObservationIdAtom)
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
      await calcNavigation({
        to: {
          lat,
          lng,
        },
        playerId,
      })
      trpc.player.getMe.invalidate()
    },
    [calcNavigation, playerId, setObservationId, trpc.player.getMe]
  )

  return { navigate }
}
