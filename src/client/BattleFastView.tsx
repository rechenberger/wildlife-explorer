import NiceModal from "@ebay/nice-modal-react"
import { BattleViewModal } from "./BattleViewModal"
import { MyCatchesModal } from "./MyCatchesModal"
import { TypeBadge } from "./TypeBadge"
import { careIcon, pastIcon, swapIcon } from "./typeIcons"

export const BattleFastView = () => {
  return (
    <>
      <div className="flex flex-col pt-6 gap-4">
        <div className="flex flex-row">
          <div className="flex-1 flex flex-col gap-3">
            <div className="font-bold text-xs opacity-60 text-left">
              My Team
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="font-bold text-xs opacity-60 text-right">
              Wildlife
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <TypeBadge
            icon={swapIcon}
            content={"Swap"}
            size="big"
            className="flex-1"
            onClick={() => {
              NiceModal.show(MyCatchesModal)
            }}
          />
          <TypeBadge
            icon={careIcon}
            content={"Care"}
            size="big"
            className="flex-1"
            onClick={() => {}}
          />
          <TypeBadge
            icon={pastIcon}
            content={"Recent"}
            size="big"
            className="flex-1"
            onClick={() => {
              NiceModal.show(BattleViewModal)
            }}
          />
        </div>
      </div>
    </>
  )
}
