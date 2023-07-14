import * as ProgressPrimitive from "@radix-ui/react-progress"
import { map } from "lodash-es"
import { Fragment } from "react"
import { type RouterOutputs } from "~/utils/api"
import { FighterChip } from "./FighterChip"
import { cn } from "./cn"

export type ExpReports = NonNullable<
  RouterOutputs["battle"]["makeChoice"]
>["expReports"]

export const ExpReportsView = ({ expReports }: { expReports: ExpReports }) => {
  return (
    <>
      <div className="mb-4">🏆 Winner Winner, Exp Dinner 🎉</div>
      <div className="grid grid-cols-[11rem_1fr_auto] gap-4 justify-start items-center p-2">
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
                <div>
                  {expReport.expPercentageBefore &&
                    expReport.expPercentageAfter && (
                      <ProgressPrimitive.Root
                        className={cn(
                          "relative h-4 w-full overflow-hidden rounded-full bg-slate-100",
                          "h-2",
                          !!expReport.levelGained && "animate-pulse"
                        )}
                      >
                        <ProgressPrimitive.Indicator
                          className="absolute inset-0 h-full w-full flex-1 bg-green-600 transition-all"
                          style={{
                            transform: `translateX(-${
                              100 -
                              (expReport.expPercentageAfter.expPercentage || 0)
                            }%)`,
                          }}
                        />
                        <ProgressPrimitive.Indicator
                          className="absolute inset-0 h-full w-full flex-1 bg-slate-900 transition-all"
                          style={{
                            transform: `translateX(-${
                              100 -
                              (expReport.expPercentageBefore.expPercentage || 0)
                            }%)`,
                          }}
                        />
                      </ProgressPrimitive.Root>
                    )}
                </div>
                <div className="flex flex-col text-sm">
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
