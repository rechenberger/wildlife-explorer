import NiceModal from "@ebay/nice-modal-react"
import { useCallback } from "react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { usePlayer } from "./usePlayer"

export const useAttackWildlife = () => {
  const { playerId } = usePlayer()
  const trpc = api.useContext()
  const { mutateAsync, isLoading: attackWildlifeLoading } =
    api.battle.attackWildlife.useMutation({
      onSuccess: (data) => {
        trpc.battle.invalidate()
        NiceModal.show(BattleViewModal, {
          battleId: data.id,
        })
      },
    })
  const attackWildlife = useCallback(
    ({ wildlifeId }: { wildlifeId: string }) => {
      if (!playerId) return

      const promise = mutateAsync({ wildlifeId, playerId })
      toast.promise(promise, {
        loading: "Starting Battle...",
        success: "The Battle is on! 🔥",
        error: (err) => err.message || "Failed to start battle. Try again.",
      })
    },
    [mutateAsync, playerId]
  )

  return { attackWildlife, attackWildlifeLoading }
}
