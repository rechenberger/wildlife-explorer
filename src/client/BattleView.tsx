import { find, flatMap, map } from "lodash-es"
import { Undo2 } from "lucide-react"
import Image from "next/image"
import { Fragment } from "react"
import { toast } from "sonner"
import {
  DEV_MODE,
  MAX_FIGHTERS_PER_TEAM,
  MAX_MOVES_PER_FIGHTER,
} from "~/config"
import { parseBattleLog } from "~/server/lib/battle/battleLogParser"
import { api } from "~/utils/api"
import { replaceByWildlife } from "~/utils/replaceByWildlife"
import { TypeBadge } from "./TypeBadge"
import { cn } from "./cn"
import { Progress } from "./shadcn/ui/progress"
import { ScrollArea } from "./shadcn/ui/scroll-area"
import {
  abilityIcon,
  catchIcon,
  getTypeIcon,
  itemIcon,
  leaveIcon,
  natureIcon,
  runIcon,
} from "./typeIcons"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { usePlayer } from "./usePlayer"

const BIG_INACTIVE_FIGHTER = false
const SHOW_ENEMY_MOVES = false
const SHOW_INACTIVE_MOVES = true
const SHOW_FIGHTER_NAME = false
const SHOW_FIGHTER_TYPES = true
const SHOW_ABILITY = false
const SHOW_NATURE = false
const SHOW_LOG = DEV_MODE

export const BattleView = ({
  onClose,
  battleId,
}: {
  onClose: () => void
  battleId: string
}) => {
  const { playerId } = usePlayer()

  const { data, isFetching: battleLoading } =
    api.battle.getBattleStatus.useQuery(
      {
        battleId,
        playerId: playerId!,
      },
      {
        enabled: !!playerId,
        onSuccess: (data) => {
          console.log(data)
        },
      }
    )

  const battleLogAsHtml = parseBattleLog(data?.battleStatus.outputLog, true)

  const trpc = api.useContext()
  const { mutate: makeChoice, isLoading: choiceLoading } =
    api.battle.makeChoice.useMutation({
      onSuccess: () => {
        trpc.battle.invalidate()
      },
      onError: (err) => toast.error(err.message),
    })
  const { mutate: reset } = api.battle.reset.useMutation({
    onSuccess: () => {
      trpc.battle.invalidate()
    },
  })
  const { mutate: run } = api.battle.run.useMutation({
    onSuccess: () => {
      onClose()
      toast.success("Ran away successfully!")
      trpc.battle.invalidate()
    },
  })

  const isLoading = battleLoading || choiceLoading

  const getName = useGetWildlifeName()

  const { mutateAsync: doCatch } = api.catch.catch.useMutation({
    onSettled: () => {
      trpc.catch.invalidate()
      trpc.wildlife.invalidate()
      trpc.battle.invalidate()
    },
  })

  if (!data) {
    return (
      <div className="flex items-center justify-center py-48 text-center text-sm opacity-60">
        Loading...
      </div>
    )
  }

  const { battleStatus, status } = data

  const battleIsActive = status === "IN_PROGRESS"

  const catchButton = () => {
    if (!playerId) return

    // Find un-caught wildlife
    const wildlifeId = find(
      flatMap(battleStatus.sides, (s) => s.fighters),
      (f) => !f.catch
    )?.wildlife.id

    if (!wildlifeId) {
      toast.error("No wildlife to catch")
      return
    }
    toast.promise(doCatch({ wildlifeId, playerId }), {
      loading: "Catching...",
      success: "You caught it! 🎉",
      error: (err) => err.message || "Failed to catch. Try again.",
    })
  }

  return (
    <>
      <div className="flex flex-row gap-2">
        <h3 className="flex-1">
          {battleIsActive ? "Active Battle" : "Past Battle"}
        </h3>
        {DEV_MODE && (
          <button
            className="absolute right-12 top-4 shrink-0"
            disabled={!battleIsActive}
            onClick={() => {
              if (!battleIsActive) return
              reset({
                battleId,
              })
            }}
          >
            <Undo2 size={16} />
          </button>
        )}
      </div>
      {/* <pre>{JSON.stringify(activeBattle, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(battleStatus, null, 2)}</pre> */}
      <div className="flex flex-row gap-4">
        <div className="flex flex-col-reverse gap-2 flex-1">
          {map(battleStatus?.sides, (side, sideIdx) => {
            const isMySide = side.player?.id === playerId
            const isMainSide = sideIdx === 0
            return (
              <Fragment key={sideIdx}>
                {sideIdx > 0 && (
                  <div className="flex flex-row items-center gap-2">
                    <hr className="flex-1" />
                    <div className="opacity-50">vs</div>
                    <hr className="flex-1" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex gap-2",
                    isMainSide
                      ? "flex-col items-start"
                      : "flex-col-reverse items-end"
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col gap-2 self-stretch",
                      isMainSide ? "flex-col" : "flex-col-reverse"
                    )}
                  >
                    {map(side.fighters, (fighter) => {
                      const {
                        hp,
                        hpMax,
                        isActive,
                        moves,
                        status,
                        lastMove,
                        justFainted,
                      } = fighter.fighterStatus
                      if (!isActive && !BIG_INACTIVE_FIGHTER && !justFainted)
                        return null
                      const hpFull = hp >= hpMax
                      const fainted = hp <= 0
                      return (
                        <Fragment
                          key={fighter.catch?.id ?? fighter.wildlife.id}
                        >
                          <div
                            className={cn(
                              "rounded-full border border-dashed border-black/10 bg-black/5 px-4 py-1 text-xs text-black/60",
                              isMainSide
                                ? "ml-4 self-start rounded-bl-none"
                                : "mr-4 self-end rounded-tr-none"
                            )}
                          >
                            {isLoading ? (
                              <>
                                <div className="-mt-1 flex h-5 animate-pulse justify-center gap-0.5 text-lg font-extrabold">
                                  <div className="animate-bounce">•</div>
                                  <div className="animate-bounce delay-75">
                                    •
                                  </div>
                                  <div className="animate-bounce delay-150">
                                    •
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="italic text-black">
                                  {getName(fighter.wildlife)}
                                </span>{" "}
                                {/* {lastMove ? (
                                <>
                                  uses{" "}
                                  <span className="italic text-black">
                                    {lastMove.name}
                                  </span>
                                  , dealing{" "}
                                  <span className="italic text-black">
                                    {lastMove.totalDamage || "no"}
                                  </span>{" "}
                                  damage
                                </>
                              ) : justFainted ? (
                                "fainted"
                              ) : (
                                "enters the battle"
                              )} */}
                              </>
                            )}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-2",
                              isMainSide ? "flex-row" : "flex-row-reverse",
                              isMainSide ? "items-start" : "items-end"
                            )}
                          >
                            <div
                              className={cn(
                                "flex w-44 flex-col gap-2",
                                isMainSide ? "flex-col" : "flex-col-reverse"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex items-center gap-4 rounded-full bg-black/10",
                                  isMainSide ? "flex-row" : "flex-row-reverse"
                                  // 'ring',
                                  // hpFull
                                  //   ? "ring-green-500"
                                  //   : dead
                                  //   ? "ring-red-500"
                                  //   : "ring-amber-400"
                                )}
                              >
                                <div
                                  className={cn(
                                    "relative -m-1 aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-full ring",
                                    hpFull
                                      ? "ring-green-500"
                                      : fainted
                                      ? "ring-red-500"
                                      : "ring-amber-400",
                                    !isActive && !justFainted && "grayscale"
                                  )}
                                >
                                  {fighter.wildlife.metadata
                                    .taxonImageUrlSquare && (
                                    <Image
                                      src={
                                        fighter.wildlife.metadata
                                          .taxonImageUrlSquare
                                      }
                                      className="w-full object-cover object-center"
                                      alt={"Observation"}
                                      unoptimized
                                      fill={true}
                                    />
                                  )}
                                </div>
                                <div
                                  className={cn("flex-1 overflow-hidden py-1")}
                                >
                                  <div className="flex items-baseline gap-1">
                                    <div
                                      className="truncate text-xs font-bold"
                                      title={`${getName(fighter.wildlife)} ${
                                        DEV_MODE
                                          ? `(${fighter.fighter.species} ${fighter.fighter.level} ${fighter.fighter.gender})`
                                          : ""
                                      }`}
                                    >
                                      {fighter.wildlife
                                        ? getName(fighter.wildlife)
                                        : fighter.fighter.name}
                                    </div>
                                    {SHOW_FIGHTER_NAME && (
                                      <div
                                        title={fighter.fighter.species}
                                        className="whitespace-nowrap text-[10px] opacity-60"
                                      >
                                        {` ${fighter.fighter.species} ${fighter.fighter.level} ${fighter.fighter.gender}`}
                                      </div>
                                    )}
                                  </div>
                                  <Progress
                                    value={(hp / hpMax) * 100}
                                    className="h-1 bg-slate-400"
                                  />

                                  <div className="flex flex-row gap-1 text-xs">
                                    <div className="truncate opacity-60">
                                      {isMySide
                                        ? `${hp}/${hpMax}`
                                        : `${Math.ceil((hp / hpMax) * 100)}%`}
                                    </div>
                                    {!!status && (
                                      <div className="rounded-sm bg-red-300 px-1">
                                        {status.toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="w-2" />
                              </div>
                              <div
                                className={cn(
                                  "my-1 flex flex-wrap gap-1",
                                  isMainSide ? "flex-row" : "flex-row-reverse"
                                )}
                              >
                                {SHOW_FIGHTER_TYPES && (
                                  <>
                                    {map(
                                      fighter.fighterStatus.types,
                                      (type) => {
                                        const icon = getTypeIcon(type)
                                        return (
                                          <TypeBadge
                                            key={type}
                                            title={type}
                                            icon={icon}
                                            content={type}
                                          />
                                        )
                                      }
                                    )}
                                  </>
                                )}

                                {SHOW_ABILITY && (
                                  <TypeBadge
                                    title={replaceByWildlife(
                                      fighter.fighterStatus.ability.desc
                                    )}
                                    icon={abilityIcon}
                                    content={fighter.fighterStatus.ability.name}
                                  />
                                )}
                                {SHOW_NATURE && (
                                  <TypeBadge
                                    title={"Nature"}
                                    icon={natureIcon}
                                    content={fighter.fighter.nature}
                                  />
                                )}

                                {fighter.fighter.item && (
                                  <TypeBadge
                                    title={fighter.fighter.item}
                                    icon={itemIcon}
                                    content={fighter.fighter.item}
                                  />
                                )}
                              </div>
                            </div>
                            {/* <div className="hidden flex-1 md:flex" /> */}
                            {(isMySide || SHOW_ENEMY_MOVES) &&
                              (isActive || SHOW_INACTIVE_MOVES) && (
                                <div className="grid flex-1 grid-cols-1 gap-1">
                                  {map(
                                    fillWithNulls(moves, MAX_MOVES_PER_FIGHTER),
                                    (move, moveIdx) => {
                                      // console.log(move)
                                      const disabled =
                                        !move ||
                                        isLoading ||
                                        !isActive ||
                                        !isMySide ||
                                        !battleIsActive
                                      const typeIcon = move?.definition.type
                                        ? getTypeIcon(move?.definition.type)
                                        : null
                                      return (
                                        <button
                                          key={moveIdx}
                                          className={cn(
                                            "truncate rounded-md bg-black/10 text-xs",
                                            disabled && "opacity-20",
                                            "flex items-center",
                                            typeIcon?.bgHalf,
                                            "ring-inset hover:ring",
                                            typeIcon?.ringFull
                                          )}
                                          disabled={disabled}
                                          onClick={() => {
                                            if (!move) return
                                            if (!playerId) return
                                            makeChoice({
                                              battleId,
                                              playerId: playerId,
                                              choice: `move ${moveIdx + 1}`,
                                            })
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
                                            title={replaceByWildlife(
                                              move?.definition.desc || ""
                                            )}
                                          >
                                            <div className="flex-1 truncate text-left">
                                              {move?.name || "-"}
                                            </div>
                                            <div
                                              className="hidden w-2 shrink-0 opacity-60 sm:block"
                                              title={
                                                readableEffectiveness(
                                                  (move as any) ?? {}
                                                ).desc
                                              }
                                            >
                                              {
                                                readableEffectiveness(
                                                  (move as any) ?? {}
                                                ).symbol
                                              }
                                            </div>
                                            <div className="hidden w-5 shrink-0 opacity-60 sm:block">
                                              {move?.definition.accuracy}
                                            </div>
                                            <div className="hidden w-5 shrink-0 opacity-60 sm:block">
                                              {move?.definition.basePower}
                                            </div>
                                            <div className="w-8 shrink-0 opacity-60">
                                              {move?.status?.pp}/
                                              {move?.status?.maxpp}
                                            </div>
                                          </div>
                                        </button>
                                      )
                                    }
                                  )}
                                </div>
                              )}
                          </div>
                        </Fragment>
                      )
                    })}
                  </div>
                  <div
                    className={cn(
                      "flex w-full items-center gap-1",
                      isMainSide ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    {side.fighters.length >= 2 &&
                      map(
                        fillWithNulls(side.fighters, MAX_FIGHTERS_PER_TEAM),
                        (fighter, fighterIdx) => {
                          if (!fighter) {
                            return (
                              <div
                                key={fighterIdx}
                                className={cn(
                                  "relative aspect-square h-4 w-4 overflow-hidden rounded-full border-2",
                                  "border-gray-100 bg-gray-50"
                                )}
                              />
                            )
                          }

                          const { hp, hpMax } = fighter.fighterStatus
                          const hpFull = hp >= hpMax
                          const dead = hp <= 0
                          return (
                            <Fragment key={fighterIdx}>
                              <button
                                disabled={!isMySide}
                                className={cn(
                                  "relative aspect-square h-4 w-4 overflow-hidden rounded-full border-2",
                                  hpFull
                                    ? "border-green-500"
                                    : dead
                                    ? "border-red-500"
                                    : "border-amber-400",
                                  isMySide ? "cursor-pointer" : "cursor-default"
                                )}
                                onClick={() => {
                                  if (!playerId) return
                                  if (!isMySide) return
                                  makeChoice({
                                    battleId,
                                    playerId: playerId,
                                    choice: `switch ${fighterIdx + 1}`,
                                  })
                                }}
                              >
                                {fighter.wildlife.metadata
                                  .taxonImageUrlSquare && (
                                  <Image
                                    src={
                                      fighter.wildlife.metadata
                                        .taxonImageUrlSquare
                                    }
                                    className="w-full object-cover object-center"
                                    alt={"Observation"}
                                    unoptimized
                                    fill={true}
                                  />
                                )}
                              </button>
                            </Fragment>
                          )
                        }
                      )}
                    {isMySide && (
                      <div
                        className={cn(
                          "flex flex-1 gap-2",
                          isMainSide ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {battleIsActive ? (
                          <>
                            <TypeBadge
                              size="big"
                              content="Run"
                              icon={runIcon}
                              onClick={() => {
                                if (!playerId) return
                                run({
                                  battleId,
                                  playerId,
                                })
                              }}
                              className="w-[76px] sm:w-28"
                            />
                            <TypeBadge
                              size="big"
                              content="Catch"
                              icon={catchIcon}
                              onClick={() => {
                                catchButton()
                              }}
                              className="w-[76px] sm:w-28"
                            />
                          </>
                        ) : (
                          <>
                            <TypeBadge
                              size="big"
                              content="Leave"
                              icon={leaveIcon}
                              onClick={() => {
                                onClose()
                              }}
                              className="w-[76px] sm:w-28"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* <div className="text-xl">
                      {isMySide ? "You" : side.name}
                    </div> */}
                </div>
              </Fragment>
            )
          })}
        </div>
        {SHOW_LOG && (
          <div className="flex-1 border-l p-2 hidden lg:flex flex-col h-[400px]">
            <ScrollArea className="">
              <div
                className="prose overflow-auto prose-sm"
                dangerouslySetInnerHTML={{ __html: battleLogAsHtml }}
              />
            </ScrollArea>
          </div>
        )}
      </div>
    </>
  )
}

function fillWithNulls<T>(arr: T[], length: number) {
  const result: (T | null)[] = [...arr]
  while (result.length < length) {
    result.push(null)
  }
  return result
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
