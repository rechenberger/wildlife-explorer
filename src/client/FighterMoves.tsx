import { map } from "lodash-es"
import { MAX_MOVES_PER_FIGHTER } from "~/config"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { replaceByWildlife } from "~/utils/replaceByWildlife"
import { type FighterForChip } from "./FighterChip"
import { cn } from "./cn"
import { getTypeIcon } from "./typeIcons"

export const FighterMoves = ({
  fighter,
  disabled: allDisabled,
  onClick,
}: {
  fighter: FighterForChip
  disabled?: boolean
  onClick?: (options: { moveIdx: number }) => void
}) => {
  const moves = fighter.fighter.moves
  return (
    <>
      <div className="grid flex-1 grid-cols-1 gap-1">
        {map(fillWithNulls(moves, MAX_MOVES_PER_FIGHTER), (move, moveIdx) => {
          // console.log(move)
          const disabled = !move || allDisabled
          const typeIcon = move?.definition.type
            ? getTypeIcon(move?.definition.type)
            : null
          return (
            <button
              key={moveIdx}
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
                  title={typeIcon.name}
                >
                  <typeIcon.icon className="h-4 w-4" />
                </div>
              )}
              <div
                className="flex flex-1 gap-3 overflow-hidden py-1 pl-1 pr-2 text-right"
                title={replaceByWildlife(move?.definition.desc || "")}
              >
                <div className="flex-1 truncate text-left">
                  {move?.name || "-"}
                </div>
                <div
                  className="hidden w-2 shrink-0 opacity-60 sm:block"
                  title={readableEffectiveness((move as any) ?? {}).desc}
                >
                  {readableEffectiveness((move as any) ?? {}).symbol}
                </div>
                <div className="hidden w-5 shrink-0 opacity-60 sm:block">
                  {move?.definition.accuracy}
                </div>
                <div className="hidden w-5 shrink-0 opacity-60 sm:block">
                  {move?.definition.basePower}
                </div>
                <div className="w-8 shrink-0 opacity-60">
                  {move?.status?.pp}/{move?.status?.maxpp}
                </div>
              </div>
            </button>
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
