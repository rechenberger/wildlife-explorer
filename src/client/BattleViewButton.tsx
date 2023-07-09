import NiceModal from "@ebay/nice-modal-react"
import { atom } from "jotai"
import { find } from "lodash-es"
import { Swords } from "lucide-react"
import { type LatLng } from "~/server/schema/LatLng"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { MyCatchesModal } from "./MyCatchesModal"
import { cn } from "./cn"
import { usePlayer } from "./usePlayer"

export const scanningLocationAtom = atom<LatLng | null>(null)

export const BattleViewButton = () => {
  const { playerId } = usePlayer()
  const { data: battles } = api.battle.getMyBattles.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  const activeBattle = find(battles, (b) => b.status === "IN_PROGRESS")
  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn("relative rounded-xl bg-black p-2 text-white")}
          onClick={async () => {
            if (activeBattle) {
              NiceModal.show(BattleViewModal, {
                battleId: activeBattle.id,
              })
            } else {
              NiceModal.show(MyCatchesModal, {})
            }
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
