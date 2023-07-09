import NiceModal from "@ebay/nice-modal-react"
import { atom } from "jotai"
import { Swords } from "lucide-react"
import { type LatLng } from "~/server/schema/LatLng"
import { BattleViewModal } from "./BattleViewModal"
import { cn } from "./cn"

export const scanningLocationAtom = atom<LatLng | null>(null)

export const BattleViewButton = () => {
  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn("relative rounded-xl bg-black p-2 text-white")}
          onClick={async () => {
            NiceModal.show(BattleViewModal)
          }}
        >
          <Swords size={32} />
        </button>
        <div className="font-bold [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]">
          Battle
        </div>
      </div>
    </>
  )
}
