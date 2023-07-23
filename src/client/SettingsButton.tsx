import NiceModal from "@ebay/nice-modal-react"
import { Settings } from "lucide-react"
import { SettingsViewModal } from "./SettingsViewModal"
import { cn } from "./cn"

export const SettingsButton = () => {
  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn("relative rounded-xl bg-black p-2 text-white")}
          onClick={async () => {
            NiceModal.show(SettingsViewModal, {})
          }}
        >
          <Settings size={32} />
        </button>
        <div className="font-bold [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]">
          Settings
        </div>
      </div>
    </>
  )
}
