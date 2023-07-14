import { Fragment } from "react"
import { type BattleReportFighter } from "~/server/lib/battle/BattleReport"
import { CatchDetails } from "./CatchDetails"

export const BattleFighterSelect = ({
  fighters,
}: {
  fighters: BattleReportFighter[]
}) => {
  return (
    <>
      <div className="">Select your next Fighter</div>
      <div className="flex flex-col gap-2">
        {fighters.map((fighter, idx) => {
          if (!fighter.catch) return null
          return (
            <Fragment key={idx}>
              <CatchDetails catchId={fighter.catch.id} tiny />
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
