import NiceModal from "@ebay/nice-modal-react"
import { atom } from "jotai"
import { Swords } from "lucide-react"
import { useEffect } from "react"
import { ENABLE_BATTLE_VIEW } from "~/config"
import { type LatLng } from "~/server/schema/LatLng"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { cn } from "./cn"
import { usePlayer } from "./usePlayer"

export const scanningLocationAtom = atom<LatLng | null>(null)

export const BattleViewButton = () => {
  const { playerId } = usePlayer()
  const { data: latestParticipation } =
    api.battle.getMyLatestParticipation.useQuery(
      {
        playerId: playerId!,
      },
      {
        enabled: !!playerId,
        refetchInterval: 2000,
      }
    )

  const activeBattleId =
    latestParticipation?.battle?.status === "IN_PROGRESS"
      ? latestParticipation?.battle?.id
      : undefined
  const pvpInviteBattleId =
    latestParticipation?.battle?.status === "INVITING"
      ? latestParticipation?.battle?.id
      : undefined

  useEffect(() => {
    if (!pvpInviteBattleId) return
    NiceModal.show(BattleViewModal, {
      battleId: pvpInviteBattleId,
    })
  }, [activeBattleId, pvpInviteBattleId])

  if (!ENABLE_BATTLE_VIEW) return null

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn("relative rounded-xl bg-black p-2 text-white")}
          onClick={async () => {
            NiceModal.show(BattleViewModal, {
              battleId: activeBattleId ?? pvpInviteBattleId ?? undefined,
            })
          }}
        >
          <Swords size={32} />
          {!!activeBattleId && (
            <>
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
              <div className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-red-500" />
            </>
          )}
          {!!pvpInviteBattleId && (
            <>
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-yellow-500" />
              <div className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-yellow-500" />
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
