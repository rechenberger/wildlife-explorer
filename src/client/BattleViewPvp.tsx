import { map } from "lodash-es"
import { Swords } from "lucide-react"
import { Fragment } from "react"
import { api, type RouterOutputs } from "~/utils/api"
import { cn } from "./cn"
import { DividerHeading } from "./DividerHeading"
import { TypeBadge } from "./TypeBadge"
import { readyIcon, runIcon, waitingIcon } from "./typeIcons"
import { usePlayer } from "./usePlayer"

type PvpStatus = RouterOutputs["pvp"]["getStatus"]

export const BattleViewPvp = ({
  pvpStatus,
  battleId,
}: {
  pvpStatus: PvpStatus
  battleId: string
}) => {
  const { playerId } = usePlayer()
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
    <div className="flex flex-col justify-center text-center gap-4">
      <Swords className="w-8 h-8 self-center" />
      <div>PvP Battle</div>

      <div className="flex flex-col gap-4">
        {map(pvpStatus.players, (p, idx) => {
          const isMe = p.id === playerId
          const ready = p.isReady
          return (
            <Fragment key={p.id}>
              {idx > 0 && <DividerHeading className="m-0">vs.</DividerHeading>}
              <div className="flex flex-col gap-2">
                <div>{p.name}</div>
                <TypeBadge
                  icon={ready ? readyIcon : waitingIcon}
                  content={ready ? "Ready!" : isMe ? "Ready?" : "Waiting..."}
                  size="big"
                  onClick={
                    isMe && !ready
                      ? () => {
                          if (!playerId) return
                          acceptInvite({
                            battleId,
                            playerId,
                          })
                        }
                      : undefined
                  }
                  className={cn(
                    "self-center w-40",
                    ready ? "animate - pulse" : undefined
                  )}
                />
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
