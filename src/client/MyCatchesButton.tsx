import NiceModal from "@ebay/nice-modal-react"
import { HeartHandshake, HeartPulse } from "lucide-react"
import { useCare } from "./CareButton"
import { MyCatchesModal } from "./MyCatchesModal"
import { PlaceViewModal } from "./PlaceViewModal"
import { cn } from "./cn"
import { useCareCenter } from "./useCareCenter"

export const MyCatchesButton = () => {
  const { careCenterIsClose, nearestCareCenter } = useCareCenter()
  const { care } = useCare()

  return (
    <>
      <div className="flex flex-col items-center gap-1 relative">
        <button
          className={cn(
            "relative rounded-xl bg-black p-2 text-white",
            careCenterIsClose && "bg-purple-500"
          )}
          onClick={async (e) => {
            if (careCenterIsClose && nearestCareCenter) {
              if (e.shiftKey) {
                care()
              } else {
                NiceModal.show(PlaceViewModal, {
                  placeId: nearestCareCenter.careCenter.id,
                })
              }
            } else {
              NiceModal.show(MyCatchesModal, {})
            }
          }}
        >
          {careCenterIsClose ? (
            <HeartPulse size={32} />
          ) : (
            <HeartHandshake size={32} />
          )}
        </button>
        <div className="font-bold [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]">
          {careCenterIsClose ? "Care" : "Catch"}
        </div>
      </div>
    </>
  )
}
