import NiceModal from "@ebay/nice-modal-react"
import { atom } from "jotai"
import { find } from "lodash-es"
import { Swords } from "lucide-react"
import { ENABLE_BATTLE_VIEW } from "~/config"
import { type LatLng } from "~/server/schema/LatLng"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
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

  if (!ENABLE_BATTLE_VIEW) return null

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn("relative rounded-xl bg-black p-2 text-white")}
          onClick={async () => {
            NiceModal.show(BattleViewModal, {
              battleId: activeBattle?.id ?? undefined,
            })
          }}
        >
          <Swords size={32} />
          {!!activeBattle && (
            <>
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
              <div className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-red-500" />
            </>
          )}
        </button>
        <div className="font-bold [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]">
          Battle
        </div>
      </div>
    </>
  )
}
