import NiceModal from "@ebay/nice-modal-react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { ExpReportsModal } from "./ExpReportsModal"
import { confetti } from "./confetti"
import { usePlayer } from "./usePlayer"

export const useCatch = ({ battleId }: { battleId?: string } = {}) => {
  const { playerId } = usePlayer()

  const trpc = api.useContext()
  const { mutateAsync, isLoading } = api.catch.catch.useMutation({
    onSettled: () => {
      trpc.catch.invalidate()
      trpc.wildlife.invalidate()
      trpc.battle.invalidate()
    },
    onSuccess: (data) => {
      confetti()
      const expReports = data?.expReports
      if (expReports) {
        if (battleId) NiceModal.hide(BattleViewModal)
        NiceModal.show(ExpReportsModal, {
          expReports,
          prevBattleId: battleId,
        })
      }
    },
  })

  const doCatch = async ({ wildlifeId }: { wildlifeId: string }) => {
    if (!playerId) return

    const promise = mutateAsync({ wildlifeId, playerId })
    toast.promise(promise, {
      loading: "Catching...",
      success: "You caught it! 🎉",
      error: (err) => err.message || "Failed to catch. Try again.",
    })
  }

  return { doCatch, isLoading }
}
