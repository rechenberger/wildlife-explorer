import NiceModal from "@ebay/nice-modal-react"
import { ArrowLeftRight } from "lucide-react"
import { Button } from "react-day-picker"
import { CareButton } from "./CareButton"
import { MyCatchesModal } from "./MyCatchesModal"

const SHOW_FLUFF = true
export const PlaceViewWildlifeCareCenter = () => {
  return (
    <>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          This is the perfect place to rest, rejuvenate your team, and prepare
          for your next battle.
        </div>
      )}
      <div className="flex flex-col w-56">
        <CareButton />
      </div>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          Don&apos;t forget to manage your team and strategize by swapping
          moves.
        </div>
      )}
      <div className="flex flex-col w-56">
        <Button
          onClick={() => {
            NiceModal.show(MyCatchesModal)
          }}
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          <span>Manage my Team</span>
        </Button>
      </div>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          Remember, every battle is a step closer to becoming the ultimate
          Wildlife Explorer. Let&apos;s get ready for the next adventure!
        </div>
      )}
    </>
  )
}
