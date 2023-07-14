import NiceModal from "@ebay/nice-modal-react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { ExpReportsModal } from "./ExpReportsModal"
import { confetti } from "./confetti"

export const useMakeChoice = () => {
  const trpc = api.useContext()

  return api.battle.makeChoice.useMutation({
    onSuccess: (data) => {
      trpc.battle.invalidate()

      if (data) {
        const expReports = data?.expReports
        if (data?.iAmWinner) {
          confetti()
          if (expReports) {
            NiceModal.show(ExpReportsModal, {
              expReports,
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
