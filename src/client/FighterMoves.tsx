import { map, some } from "lodash-es"
import { Fragment } from "react"
import { MAX_MOVES_PER_FIGHTER } from "~/config"
import { type BattleReportFighter } from "~/server/lib/battle/BattleReport"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { replaceByWildlife } from "~/utils/replaceByWildlife"
import { cn } from "./cn"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./shadcn/ui/hover-card"
import { getTypeIcon } from "./typeIcons"

export const FighterMoves = ({
  fighter,
  disabled: allDisabled,
  onClick,
}: {
  fighter: BattleReportFighter
  disabled?: boolean
  onClick?: (options: { moveIdx: number }) => void
}) => {
  const moves = fighter.fighter.moves
  return (
    <>
      <div className="grid flex-1 grid-cols-1 gap-1">
        {map(fillWithNulls(moves, MAX_MOVES_PER_FIGHTER), (move, moveIdx) => {
          // console.log(move)

          const disabled =
            !move ||
            allDisabled ||
            (!!fighter.fighter.trappedInMoves &&
              !some(
                fighter.fighter.trappedInMoves,
                (trappedMove) => trappedMove.id === move.id
              ))
          const typeIcon = move?.definition.type
            ? getTypeIcon(move?.definition.type)
            : null

          const effectiveness = readableEffectiveness((move as any) ?? {})
          return (
            <Fragment key={moveIdx}>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    className={cn(
                      "truncate rounded-md bg-gray-200 text-xs",
                      disabled && "opacity-20",
                      "flex items-center",
                      typeIcon?.bgHalf,
                      "ring-inset hover:ring",
                      typeIcon?.ringFull
                    )}
                    disabled={disabled}
                    onClick={() => {
                      if (!move) return
                      if (!onClick) return
                      onClick({ moveIdx })
                    }}
                  >
                    {typeIcon && (
                      <div
                        className={cn(
                          "flex h-full items-center justify-center rounded-md p-1.5",
                          typeIcon.bgFull
                        )}
                      >
                        <typeIcon.icon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex flex-1 gap-3 overflow-hidden py-1 pl-1 pr-2 text-right">
                      <div className="flex-1 truncate text-left">
                        {move?.name || "-"}
                      </div>
                      {!!effectiveness && (
                        <div className="hidden w-2 shrink-0 opacity-60 sm:block">
                          {effectiveness.symbol}
                        </div>
                      )}
                      <div className="hidden w-5 shrink-0 opacity-60 sm:block">
                        {move?.definition.basePower}
                      </div>
                      <div className="hidden w-5 shrink-0 opacity-60 sm:block">
                        {move?.definition.accuracy}
                      </div>
                      <div className="w-8 shrink-0 opacity-60">
                        {move?.status?.pp}/{move?.status?.maxpp}
                      </div>
                    </div>
                  </button>
                </HoverCardTrigger>
                {move && (
                  <HoverCardContent className="w-80 flex flex-col gap-2">
                    <div className="font-bold opacity-80">{move.name}</div>
                    <div className="text-sm opacity-80">
                      {replaceByWildlife(move.definition.desc)}
                    </div>
                    <div className="flex flex-row gap-1 text-center text-sm items-center mt-4">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="text-xs font-bold opacity-60">
                          Category
                        </div>
                        <div>{move.definition.category}</div>
                      </div>
                      <div className="w-px bg-black/60 self-stretch" />
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="text-xs font-bold opacity-60">
                          Power
                        </div>
                        <div>{move.definition.basePower}</div>
                      </div>
                      <div className="w-px bg-black/60 self-stretch" />
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="text-xs font-bold opacity-60">
                          Accuracy
                        </div>
                        <div>
                          {move.definition.accuracy === true
                            ? "Always hits"
                            : move.definition.accuracy}
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-black/60 self-stretch" />
                    <div className="flex flex-row gap-1 text-center text-sm items-center">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="text-xs font-bold opacity-60">Type</div>
                        <div>{move.definition.type}</div>
                      </div>
                      <div className="w-px bg-black/60 self-stretch" />
                      {effectiveness && (
                        <>
                          <div className="flex-1 flex flex-col gap-1">
                            <div className="text-xs font-bold opacity-60">
                              Effectiveness
                            </div>
                            <div>{effectiveness?.desc}</div>
                          </div>
                          <div className="w-px bg-black/60 self-stretch" />
                        </>
                      )}
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="text-xs font-bold opacity-60">
                          Uses Left
                        </div>
                        <div>
                          {move?.status?.pp}/{move?.status?.maxpp}
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}

const readableEffectiveness = ({
  effectiveness,
  immunity,
}: {
  effectiveness?: 0 | -1 | 1 | -2 | 2 | null
  immunity?: boolean | null
}) => {
  if (effectiveness == undefined || effectiveness == undefined) {
    return null
  }
  if (!immunity) {
    return {
      symbol: "x",
      desc: "immune",
    }
  }
  if (effectiveness === -2) {
    return {
      symbol: "--",
      desc: "wet noodel",
    }
  }
  if (effectiveness === -1) {
    return {
      symbol: "-",
      desc: "not very effective",
    }
  }
  if (effectiveness === 0) {
    return {
      symbol: "o",
      desc: "effective",
    }
  }
  if (effectiveness === 1) {
    return {
      symbol: "+",
      desc: "super effective",
    }
  }
  if (effectiveness === 2) {
    return {
      symbol: "++",
      desc: "super duper effective",
    }
  }
  console.warn("Unknown effectiveness", { effectiveness, immunity })
  return {
    symbol: "?",
    desc: "???",
  }
}
