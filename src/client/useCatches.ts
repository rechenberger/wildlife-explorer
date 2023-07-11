import { api, type RouterOutputs } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export type MyCatch = RouterOutputs["catch"]["getMyCatches"][number]

export const useMyCatches = () => {
  const { playerId } = usePlayer()
  const {
    data: myCatches,
    isLoading,
    isFetching,
  } = api.catch.getMyCatches.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  return {
    myCatches,
    isLoading,
    isFetching,
  }
}

export const useMyCatch = ({ catchId }: { catchId: string }) => {
  const { myCatches } = useMyCatches()
  const myCatch = myCatches?.find((c) => c.id === catchId)
  return { myCatch }
}
