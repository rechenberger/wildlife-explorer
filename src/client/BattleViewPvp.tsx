import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import { ArrowUp, Swords } from "lucide-react"
import { Fragment } from "react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { DividerHeading } from "./DividerHeading"
import { TypeBadge } from "./TypeBadge"
import { cn } from "./cn"
import { readyIcon, runIcon, waitingIcon } from "./typeIcons"
import { usePlayer } from "./usePlayer"
import { REFETCH_MS_BATTLE_PVP } from "~/config"

export const BattleViewPvp = ({ battleId }: { battleId: string }) => {
  const { playerId } = usePlayer()
  const { data: pvpStatus } = api.pvp.getStatus.useQuery(
    {
      battleId,
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      refetchInterval: REFETCH_MS_BATTLE_PVP,
      onSuccess: (data) => {
        if (data.status === "CANCELLED") {
          toast("PvP-Battle cancelled")
          NiceModal.hide(BattleViewModal)
        }
      },
    }
  )

  const trpc = api.useContext()
  const { mutate: acceptInvite } = api.pvp.acceptInvite.useMutation({
    onSuccess: () => {
      trpc.pvp.invalidate()
      trpc.battle.invalidate()
    },
  })
  const { mutate: cancelInvite } = api.pvp.cancelInvite.useMutation({
    onSuccess: () => {
      trpc.pvp.invalidate()
      trpc.battle.invalidate()
    },
  })

  return (
    <div className="flex flex-col justify-center text-center gap-4 pt-12">
      <Swords className="w-8 h-8 self-center" />
      <div>PvP Battle</div>

      <div className="flex flex-col gap-4">
        {map(pvpStatus?.players, (p, idx) => {
          const isMe = p.id === playerId
          const ready = p.isReady
          return (
            <Fragment key={p.id}>
              {idx > 0 && <DividerHeading className="m-0">vs.</DividerHeading>}
              <div className="flex flex-col gap-2">
                <div>{p.name}</div>
                <div className="flex flex-row gap-4 self-center justify-center items-center">
                  {isMe && !ready && (
                    <div className="rotate-90">
                      <ArrowUp className="w-4 h-4 animate-bounce" />
                    </div>
                  )}
                  <TypeBadge
                    icon={ready ? readyIcon : waitingIcon}
                    content={ready ? "Ready!" : isMe ? "Ready?" : "Waiting..."}
                    size="big"
                    onClick={
                      isMe
                        ? () => {
                            if (!playerId) return
                            acceptInvite({
                              battleId,
                              playerId,
                              isReady: !ready,
                            })
                          }
                        : undefined
                    }
                    className={cn(
                      "w-40",
                      ready ? "animate - pulse" : undefined
                    )}
                  />
                  {isMe && !ready && (
                    <div className="-rotate-90">
                      <ArrowUp className="w-4 h-4 animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>

      <div className="mt-8 flex flex-row justify-end">
        <TypeBadge
          icon={runIcon}
          content={"Cancel"}
          size="big"
          onClick={() => {
            if (!playerId) return
            cancelInvite({
              battleId,
              playerId,
            })
          }}
        />
      </div>
    </div>
  )
}
