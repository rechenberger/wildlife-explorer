import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

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