import { atom, useSetAtom } from "jotai"
import { useCallback } from "react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export const navigatingToObservationIdAtom = atom<number | null>(null)

export const useNavigation = () => {
  const { mutateAsync: startNavigation } =
    api.navigation.startNavigation.useMutation()
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
      try {
        await startNavigation({
          to: {
            lat,
            lng,
          },
          playerId,
        })
      } catch (error: any) {
        const msg = error?.message || "Navigation failed"
        toast.error(msg)
      }
      trpc.player.getMe.invalidate()
    },
    [startNavigation, playerId, setObservationId, trpc.player.getMe]
  )

  return { navigate }
}
