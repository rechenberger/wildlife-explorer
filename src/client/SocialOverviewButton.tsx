import NiceModal from "@ebay/nice-modal-react"
import { Users } from "lucide-react"
import { SocialOverviewModal } from "./SocialOverviewModal"
import { cn } from "./cn"
import { useLatestPendingTradeAutoOpen } from "./useLatestPendingTradeAutoOpen"

export const SocialOverviewButton = () => {
  useLatestPendingTradeAutoOpen()
  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn("relative rounded-xl bg-black p-2 text-white")}
          onClick={async () => {
            NiceModal.show(SocialOverviewModal, {})
          }}
        >
          <Users size={32} />
        </button>
        <div className="font-bold [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]">
          Connect
        </div>
      </div>
    </>
  )
}
