import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export type MyCatch = ReturnType<typeof useMyCatch>[`myCatch`]

export const useMyCatches = () => {
  const { playerId } = usePlayer()
  const { data: myCatches } = api.catch.getMyCatches.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  return {
    myCatches,
  }
}

export const useMyCatch = ({ catchId }: { catchId: string }) => {
  const { myCatches } = useMyCatches()
  const myCatch = myCatches?.find((c) => c.id === catchId)
  return { myCatch }
}
