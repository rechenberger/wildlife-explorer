import { toast } from "sonner"
import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export const useStartTrade = () => {
  const { playerId: playerId } = usePlayer()
  const { mutateAsync, isLoading: startTradeIsLoading } =
    api.trade.startTrade.useMutation()

  const startTrade = async ({
    playerId: otherPlayerId,
  }: {
    playerId: string
  }) => {
    if (!playerId) return
    const promise = mutateAsync({ playerId, otherPlayerId })
    toast.promise(promise, {
      loading: "Starting trade...",
      success: "Trade started!",
      error: (err: any) => err?.message || "Failed to start trade.",
    })
    await promise

    // TODO: open modal
  }

  return {
    startTrade,
    startTradeIsLoading,
  }
}
