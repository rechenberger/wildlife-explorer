import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import { ArrowLeftRight, Eye, Locate, Swords, User } from "lucide-react"
import { Fragment } from "react"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { SocialOverviewModal } from "./SocialOverviewModal"
import { TimeAgo } from "./TimeAgo"
import { useMapFlyTo } from "./useMapRef"
import { usePlayer } from "./usePlayer"
import { useStartTrade } from "./useStartTrade"

export const SocialOverview = () => {
  const { playerId } = usePlayer()
  const { data: players, isLoading } = api.social.getOverview.useQuery(
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

  const { startTrade, startTradeIsLoading } = useStartTrade()

  const mapFlyTo = useMapFlyTo()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )
  }

  return (
    <>
      <div className="pb-4 px-4 border-b">Players</div>
      <div className="flex flex-col">
        {map(players, (player) => (
          <Fragment key={player.id}>
            <div className="flex flex-row items-center gap-2 border-b py-4 px-4 text-left hover:bg-gray-100">
              <User size={24} className="hidden sm:flex" />
              <div className="flex flex-col">
                <div>{player.name}</div>
                <div className="text-xs opacity-60">
                  <TimeAgo date={player.updatedAt} addSuffix={true} />
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex-1" />
              <div className="flex flex-col text-xs opacity-60 text-right whitespace-nowrap">
                <div>{player._count.foundWildlife} found</div>
                <div>{player._count.catches} caught</div>
                <div>{player._count.battleParticipations} defeated</div>
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  className="flex flex-row gap-1 rounded text-xs items-center bg-black text-white px-2 py-1 border"
                  onClick={() => {
                    NiceModal.hide(SocialOverviewModal)
                    mapFlyTo({ center: player })
                  }}
                >
                  <Locate className="w-4 h-4" />
                  <div>Locate</div>
                </button>
                {playerId !== player.id && (
                  <>
                    <button
                      className="flex flex-row gap-1 rounded text-xs items-center bg-black text-white px-2 py-1 border"
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
                    <button
                      className="flex flex-row gap-1 rounded text-xs items-center bg-black text-white px-2 py-1 border"
                      disabled={startTradeIsLoading}
                      onClick={() => {
                        if (startTradeIsLoading) return
                        startTrade({
                          playerId: player.id,
                        })
                      }}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      <div>Trade</div>
                    </button>
                  </>
                )}
                {player.metadata?.activeBattleId && (
                  <button
                    className="flex flex-row gap-1 rounded text-xs items-center bg-black text-white px-2 py-1 border"
                    onClick={() => {
                      const battleId = player.metadata?.activeBattleId
                      if (!battleId) return
                      NiceModal.show(BattleViewModal, {
                        battleId,
                      })
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    <div>Watch</div>
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
