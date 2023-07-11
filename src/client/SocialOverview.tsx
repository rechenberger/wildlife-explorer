import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import { Locate, Swords, User } from "lucide-react"
import { Fragment } from "react"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { SocialOverviewModal } from "./SocialOverviewModal"
import { TimeAgo } from "./TimeAgo"
import { useMapSetCenter } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const SocialOverview = () => {
  const { playerId } = usePlayer()
  const { data: players } = api.social.getOverview.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  const { mutate: startPvp } = api.pvp.startPvp.useMutation({
    onSuccess: (battle) => {
      NiceModal.show(BattleViewModal, {
        battleId: battle.id,
      })
    },
  })

  const setMapCenter = useMapSetCenter()

  return (
    <>
      <div className="pb-4 px-4 border-b">Players</div>
      <div className="flex flex-col">
        {map(players, (player) => (
          <Fragment key={player.id}>
            <div className="flex flex-row items-center gap-2 border-b p-4 text-left hover:bg-gray-100">
              <User size={24} />
              <div className="flex flex-col">
                <div>{player.name}</div>
                <div className="text-xs opacity-60">
                  <TimeAgo date={player.updatedAt} addSuffix={true} />
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex-1" />
              <div className="flex flex-col text-xs opacity-60 text-right">
                <div>{player._count.foundWildlife} found</div>
                <div>{player._count.catches} caught</div>
                <div>{player._count.battleParticipations} defeated</div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  className="flex flex-row gap-1 rounded text-xs items-center bg-black text-white px-2 py-0.5 border"
                  onClick={() => {
                    NiceModal.hide(SocialOverviewModal)
                    setMapCenter(player)
                  }}
                >
                  <Locate className="w-4 h-4" />
                  <div>Locate</div>
                </button>
                {playerId !== player.id && (
                  <button
                    className="flex flex-row gap-1 rounded text-xs items-center bg-black text-white px-2 py-0.5 border"
                    onClick={() => {
                      if (!playerId) return
                      startPvp({
                        playerId,
                        otherPlayerId: player.id,
                      })
                    }}
                  >
                    <Swords className="w-4 h-4" />
                    <div>Battle</div>
                  </button>
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
