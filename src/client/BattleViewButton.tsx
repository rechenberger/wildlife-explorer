import NiceModal from "@ebay/nice-modal-react"
import { atom } from "jotai"
import { Castle, Swords } from "lucide-react"
import { useCallback, useEffect } from "react"
import { ENABLE_BATTLE_VIEW, REFETCH_MS_BATTLE_BUTTON } from "~/config"
import { type LatLng } from "~/server/schema/LatLng"
import { api } from "~/utils/api"
import { BattleFastViewModal } from "./BattleFastViewModal"
import { BattleViewModal } from "./BattleViewModal"
import { PlaceViewModal } from "./PlaceViewModal"
import { cn } from "./cn"
import { useKeyboardShortcut } from "./useKeyboardShortcut"
import { usePlace } from "./usePlace"
import { usePlayer } from "./usePlayer"

export const scanningLocationAtom = atom<LatLng | null>(null)

export const useLatestBattleParticipation = () => {
  const { playerId } = usePlayer()
  const {
    data: latestParticipation,
    refetch: refetchLatestBattleParticipation,
  } = api.battle.getMyLatestParticipation.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      refetchInterval: REFETCH_MS_BATTLE_BUTTON,
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

  return {
    activeBattleId,
    pvpInviteBattleId,
    refetchLatestBattleParticipation,
  }
}

export const BattleViewButton = () => {
  const { activeBattleId, pvpInviteBattleId } = useLatestBattleParticipation()
  const { isClose, nearestPlace } = usePlace({
    type: "DUNGEON",
  })

  const showDungeon = isClose && !pvpInviteBattleId && !activeBattleId

  useEffect(() => {
    if (!pvpInviteBattleId) return
    NiceModal.show(BattleViewModal, {
      battleId: pvpInviteBattleId,
    })
  }, [activeBattleId, pvpInviteBattleId])

  const openBattleView = useCallback(() => {
    if (showDungeon && nearestPlace) {
      NiceModal.show(PlaceViewModal, {
        placeId: nearestPlace.place.id,
      })
      return
    }
    const battleId = activeBattleId ?? pvpInviteBattleId
    if (battleId) {
      NiceModal.show(BattleViewModal, {
        battleId,
      })
    } else {
      NiceModal.show(BattleFastViewModal)
    }
  }, [activeBattleId, nearestPlace, pvpInviteBattleId, showDungeon])

  useKeyboardShortcut("BATTLE", openBattleView)

  if (!ENABLE_BATTLE_VIEW) return null

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn(
            "relative rounded-xl bg-black p-2 text-white",
            showDungeon && "bg-orange-500"
          )}
          onClick={async () => {
            openBattleView()
          }}
        >
          {showDungeon ? <Castle size={32} /> : <Swords size={32} />}
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
        <div
          className={cn(
            "font-bold [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]"
          )}
        >
          {showDungeon ? "Dungeon" : "Battle"}
        </div>
      </div>
    </>
  )
}
