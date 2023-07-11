import { map } from "lodash-es"
import { Swords } from "lucide-react"
import { Fragment } from "react"
import { type RouterOutputs } from "~/utils/api"
import { DividerHeading } from "./DividerHeading"
import { TypeBadge } from "./TypeBadge"
import { readyIcon, runIcon, waitingIcon } from "./typeIcons"

type PvpStatus = RouterOutputs["pvp"]["getStatus"]

export const BattleViewPvp = ({
  pvpStatus,
  battleId,
}: {
  pvpStatus: PvpStatus
  battleId: string
}) => {
  return (
    <div className="flex items-center justify-center py-48 text-center gap-4">
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
              />
            </div>
          </Fragment>
        ))}
      </div>

      <div className="mt-8 flex flex-row items-end">
        <TypeBadge icon={runIcon} content={"Cancel"} size="big" />
      </div>
    </div>
  )
}
