import { type Wildlife } from "@prisma/client"
import Image from "next/image"
import { DEV_MODE } from "~/config"
import { type WildlifeFighterPlus } from "~/server/lib/battle/getWildlifeFighterPlus"
import { type WildlifeMetadata } from "~/server/schema/WildlifeMetadata"
import { cn } from "./cn"
import { Progress } from "./shadcn/ui/progress"
import { useGetWildlifeName } from "./useGetWildlifeName"

export type FighterForChip = {
  fighter: WildlifeFighterPlus
  wildlife: Pick<Wildlife, "id"> & { metadata: WildlifeMetadata }
  name?: string | null
}

export const FighterChip = ({
  fighter,
  ltr = true,
  showAbsoluteHp,
  grayscale,
  onClick,
}: {
  fighter: FighterForChip
  ltr?: boolean
  showAbsoluteHp: boolean
  grayscale?: boolean
  onClick?: () => void
}) => {
  const { hp, hpMax, status } = fighter.fighter
  const hpFull = hp >= hpMax
  const fainted = hp <= 0
  const getName = useGetWildlifeName()
  const name = fighter.name || getName(fighter.wildlife)
  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 rounded-full bg-gray-200",
          ltr ? "flex-row" : "flex-row-reverse",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            "relative -m-1 aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-full ring",
            hpFull
              ? "ring-green-500"
              : fainted
              ? "ring-red-500"
              : "ring-amber-400",
            grayscale && "grayscale"
          )}
        >
          {fighter.wildlife.metadata.taxonImageUrlSquare && (
            <Image
              src={fighter.wildlife.metadata.taxonImageUrlSquare}
              className={cn(
                "w-full object-cover object-center transition-transform",
                fainted && "rotate-180",
                "pointer-events-none"
              )}
              alt={"Observation"}
              unoptimized
              fill={true}
            />
          )}
        </div>
        <div className={cn("flex-1 overflow-hidden py-1 select-none")}>
          <div className="flex items-baseline gap-1">
            <div
              className="truncate text-xs font-bold"
              title={`${name} ${
                DEV_MODE
                  ? `(${fighter.fighter.species} ${fighter.fighter.level} ${fighter.fighter.gender})`
                  : ""
              }`}
            >
              {name}
            </div>
            {/* {SHOW_FIGHTER_NAME && (
              <div
                title={fighter.fighter.species}
                className="whitespace-nowrap text-[10px] opacity-60"
              >
                {` ${fighter.fighter.species} ${fighter.fighter.level} ${fighter.fighter.gender}`}
              </div>
            )} */}
          </div>
          <Progress value={(hp / hpMax) * 100} className="h-1 bg-slate-400" />

          <div className="flex flex-row gap-1 text-xs justify-between">
            <div className="truncate opacity-60">
              {showAbsoluteHp
                ? `${hp}/${hpMax}`
                : `${Math.ceil((hp / hpMax) * 100)}%`}
            </div>
            {!!status && (
              <div className="rounded-sm bg-red-300 px-1">
                {status.toUpperCase()}
              </div>
            )}
            <div className="truncate opacity-60">
              Lv. {fighter.fighter.level}
            </div>
          </div>
        </div>
        <div className="w-2" />
      </div>
    </>
  )
}
