import { map } from "lodash-es"
import { Swords } from "lucide-react"
import { Fragment } from "react"
import { api, type RouterOutputs } from "~/utils/api"
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
    <div className="flex flex-col items-center justify-center py-48 text-center gap-4">
      <Swords className="w-8 h-8" />
      <div>PvP Battle</div>

      <div className="flex flex-col gap-4">
        {map(pvpStatus.players, (p, idx) => (
          <Fragment key={p.id}>
            {idx > 0 && <DividerHeading className="m-0">vs.</DividerHeading>}
            <div className="flex flex-col gap-2">
              <div>{p.name}</div>
              <TypeBadge
                icon={p.isReady ? readyIcon : waitingIcon}
                content={p.isReady ? "Ready!" : "Waiting..."}
                size="big"
                onClick={
                  p.id === playerId && !p.isReady
                    ? () => {
                        if (!playerId) return
                        acceptInvite({
                          battleId,
                          playerId,
                        })
                      }
                    : undefined
                }
                className={p.isReady ? "animate-ping" : undefined}
              />
            </div>
          </Fragment>
        ))}
      </div>

      <div className="mt-8 flex flex-row items-end">
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
