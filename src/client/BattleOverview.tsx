import NiceModal from "@ebay/nice-modal-react"
import { Award, CircleDashed, Frown } from "lucide-react"
import { Fragment } from "react"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { TimeAgo } from "./TimeAgo"
import { cn } from "./cn"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { usePlayer } from "./usePlayer"

export const BattleOverview = () => {
  const { playerId } = usePlayer()
  const { data: battles, isLoading } = api.battle.getMyBattles.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  const getName = useGetWildlifeName()
  return (
    <>
      <div className="mb-4">Recent Battles</div>
      {!battles?.length && (
        <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
          {isLoading ? (
            <>Loading...</>
          ) : (
            <>
              You haven&apos;t participated in any battles, yet.
              <br />
              Try batteling some wildlife!
            </>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {battles?.map((battle) => {
          const myParticipation = battle.battleParticipants.find(
            (p) => p.playerId === playerId
          )
          const statusLabel =
            battle.status === "IN_PROGRESS"
              ? "Active"
              : battle.status === "CANCELLED"
              ? "Cancelled"
              : battle.status === "FINISHED"
              ? "Finished"
              : "???"

          const isFinished = battle.status === "FINISHED"
          const isActive = battle.status === "IN_PROGRESS"
          const isCancelled = battle.status === "CANCELLED"
          const isWin = isFinished && myParticipation?.isWinner === true
          const isLoss = isFinished && myParticipation?.isWinner === false

          return (
            <div
              key={battle.id}
              className={cn(
                "flex flex-row items-center",
                "cursor-pointer rounded-xl bg-gray-300 bg-opacity-50 px-4 py-1 hover:bg-opacity-80",
                isActive && "animate-pulse",
                isWin && "bg-yellow-500",
                isLoss && "bg-red-500"
              )}
              onClick={() => {
                NiceModal.show(BattleViewModal, {
                  battleId: battle.id,
                })
              }}
            >
              <div className="flex-1">
                <div className="flex flex-row gap-4">
                  {battle.battleParticipants.map((p, idx) => (
                    <Fragment key={p.id}>
                      {idx > 0 && <div>vs</div>}
                      <div>
                        {p.player
                          ? p.player.name
                          : p.wildlife
                          ? getName(p.wildlife)
                          : "???"}
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div className="flex flex-row gap-1 text-xs opacity-60">
                  <div>{statusLabel}</div>
                  <TimeAgo date={battle.updatedAt} addSuffix />
                </div>
              </div>
              <div>
                {isWin ? (
                  <Award className="h-6 w-6 text-black/50" />
                ) : isLoss ? (
                  <Frown className="h-6 w-6 text-black/50" />
                ) : isCancelled ? (
                  <CircleDashed className="h-6 w-6 text-black/50" />
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
