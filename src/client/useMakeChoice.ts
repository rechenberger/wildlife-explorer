import NiceModal from "@ebay/nice-modal-react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { ExpReportsModal } from "./ExpReportsModal"
import { confetti } from "./confetti"

export const useMakeChoice = ({
  skipExpReports,
}: { skipExpReports?: boolean } = {}) => {
  const trpc = api.useContext()

  return api.battle.makeChoice.useMutation({
    onSuccess: (data, input) => {
      trpc.battle.invalidate()

      if (data) {
        trpc.invalidate()
        const expReports = data?.expReports
        if (data?.iAmWinner) {
          if (expReports && !skipExpReports) {
            confetti()
            NiceModal.hide(BattleViewModal)
            NiceModal.show(ExpReportsModal, {
              expReports,
              battleId: input.battleId,
            })
          } else {
            toast("You win! 🎉")
          }
        } else {
          toast(`${data.winnerName} won the battle!`)
        }
      }
    },
    onError: (err) => toast.error(err.message),
  })
}
