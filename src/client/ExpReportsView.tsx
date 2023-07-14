import { map } from "lodash-es"
import { Fragment } from "react"
import { type RouterOutputs } from "~/utils/api"
import { FighterChip } from "./FighterChip"

export type ExpReports = NonNullable<
  RouterOutputs["battle"]["makeChoice"]
>["expReports"]

export const ExpReportsView = ({ expReports }: { expReports: ExpReports }) => {
  return (
    <>
      <div className="grid grid-cols-[11rem_1fr_auto] gap-4 justify-start items-center p-4">
        {map(expReports, (expReport, idx) => (
          <Fragment key={idx}>
            <div className="w-44">
              <FighterChip
                fighter={expReport.battleReportFighter}
                showAbsoluteHp
                grayscale={expReport.fainted}
              />
            </div>
            {expReport.fainted ? (
              <>
                <div className="text-red-500">Fainted</div>
                <div />
              </>
            ) : (
              <>
                <div></div>
                <div className="flex flex-col">
                  <div className="text-green-600">
                    + {expReport.expGained || 0} exp
                  </div>
                  <div className="text-green-600 font-bold">
                    {!!expReport.levelGained && (
                      <span>
                        + {expReport.levelGained || 0}{" "}
                        {expReport.levelGained === 1 ? "level" : "levels"}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </Fragment>
        ))}
      </div>
    </>
  )
}
