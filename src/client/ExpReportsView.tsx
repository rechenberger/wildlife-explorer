import NiceModal from "@ebay/nice-modal-react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { map } from "lodash-es"
import { Fragment } from "react"
import { type RouterOutputs } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { ExpReportsModal } from "./ExpReportsModal"
import { FighterChip } from "./FighterChip"
import { TypeBadge } from "./TypeBadge"
import { cn } from "./cn"
import { leaveIcon, pastIcon } from "./typeIcons"

export type ExpReports = NonNullable<
  RouterOutputs["battle"]["makeChoice"]
>["expReports"]

export const ExpReportsView = ({
  expReports,
  battleId,
}: {
  expReports: ExpReports
  battleId: string
}) => {
  return (
    <>
      <div className="mb-4">🏆 Winner Winner, Exp Dinner 🎉</div>
      <div className="grid grid-cols-[11rem_1fr] gap-4 justify-start items-center p-2">
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
                <div className="text-red-500 italic text-sm">Fainted</div>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "flex flex-col"
                    // !!expReport.levelGained && "animate-pulse"
                  )}
                >
                  <div className="mt-4">
                    {expReport.expPercentageBefore &&
                      expReport.expPercentageAfter && (
                        <ProgressPrimitive.Root
                          className={cn(
                            "relative h-4 w-full overflow-hidden rounded-full bg-slate-100",
                            "h-2"
                          )}
                        >
                          <ProgressPrimitive.Indicator
                            className="absolute inset-0 h-full w-full flex-1 bg-green-600 transition-all animate-pulse"
                            style={{
                              transform: `translateX(-${
                                100 -
                                (expReport.levelGained
                                  ? 100
                                  : expReport.expPercentageAfter
                                      .expPercentage || 0)
                              }%)`,
                            }}
                          />
                          <ProgressPrimitive.Indicator
                            className="absolute inset-0 h-full w-full flex-1 bg-slate-900 transition-all"
                            style={{
                              transform: `translateX(-${
                                100 -
                                (expReport.expPercentageBefore.expPercentage ||
                                  0)
                              }%)`,
                            }}
                          />
                        </ProgressPrimitive.Root>
                      )}
                  </div>
                  <div className="flex flex-row text-xs md:text-sm gap-0 whitespace-nowrap flex-wrap">
                    <div className="text-green-600 flex-1">
                      +{expReport.expGained || 0} exp
                    </div>
                    {!!expReport.levelGained && (
                      <div className="text-green-600 font-bold animate-pulse">
                        +{expReport.levelGained || 0}{" "}
                        {expReport.levelGained === 1
                          ? "Level-up!"
                          : "Level-ups!"}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </Fragment>
        ))}
      </div>
      <div className="flex flex-row gap-2 mt-4">
        <TypeBadge
          icon={pastIcon}
          content="Back to Battle"
          className="flex-1"
          size="big"
          onClick={() => {
            NiceModal.hide(ExpReportsModal)
            NiceModal.show(BattleViewModal, {
              battleId,
            })
          }}
        />
        <TypeBadge
          icon={leaveIcon}
          content="Leave"
          className="flex-1"
          size="big"
          onClick={() => {
            NiceModal.hide(ExpReportsModal)
          }}
        />
      </div>
    </>
  )
}
