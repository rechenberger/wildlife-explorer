import NiceModal from "@ebay/nice-modal-react"
import { useAtomValue, useSetAtom } from "jotai"
import { find, flatMap, map } from "lodash-es"
import { Scroll, ScrollText, Undo2 } from "lucide-react"
import Image from "next/image"
import { Fragment, useLayoutEffect, useRef } from "react"
import { toast } from "sonner"
import { DEV_MODE, MAX_FIGHTERS_PER_TEAM } from "~/config"
import { parseBattleLog } from "~/server/lib/battle/battleLogParser"
import { api } from "~/utils/api"
import { atomWithLocalStorage } from "~/utils/atomWithLocalStorage"
import { fillWithNulls } from "~/utils/fillWithNulls"
import { BattleViewPvp } from "./BattleViewPvp"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { FighterChip } from "./FighterChip"
import { FighterMoves } from "./FighterMoves"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { TypeBadge } from "./TypeBadge"
import { cn } from "./cn"
import { catchIcon, leaveIcon, runIcon } from "./typeIcons"
import { useCatch } from "./useCatch"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { usePlayer } from "./usePlayer"

const BIG_INACTIVE_FIGHTER = false
const SHOW_ENEMY_MOVES = false
const SHOW_INACTIVE_MOVES = true
const SHOW_FIGHTER_NAME = false
const SHOW_FIGHTER_TYPES = true
const SHOW_ABILITY = false
const SHOW_NATURE = false

export const showBattleLogAtom = atomWithLocalStorage("showBattleLog", false)

export const BattleView = ({
  onClose,
  battleId,
}: {
  onClose: () => void
  battleId: string
}) => {
  const { playerId } = usePlayer()

  const showBattleLog = useAtomValue(showBattleLogAtom)
  const setShowBattleLog = useSetAtom(showBattleLogAtom)

  const { data: pvpStatus, isLoading: pvpStatusLoading } =
    api.pvp.getStatus.useQuery(
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
        refetchInterval: pvpStatus?.isPvp ? 1000 : undefined,
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

  const isLoading = pvpStatus?.isPvp
    ? false
    : battleLoading || choiceLoading || pvpStatusLoading

  const getName = useGetWildlifeName()

  const { doCatch } = useCatch()

  const logRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!logRef.current) return
    logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battleLogAsHtml, showBattleLog])

  if (!data || !pvpStatus) {
    return (
      <div className="flex items-center justify-center py-48 text-center text-sm opacity-60">
        Loading...
      </div>
    )
  }

  if (!pvpStatus.allReady) {
    return <BattleViewPvp battleId={battleId} pvpStatus={pvpStatus} />
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
    doCatch({ wildlifeId })
  }

  return (
    <>
      <div className="flex flex-row gap-2">
        <h3 className="flex-1">
          {battleIsActive ? "Active Battle" : "Past Battle"}
        </h3>

        <div className="absolute right-12 top-4 shrink-0 flex flex-row gap-4">
          {DEV_MODE && (
            <button
              title="Reset battle"
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
          <button
            title="Toggle battle log"
            className="hidden lg:block"
            onClick={() => {
              setShowBattleLog(!showBattleLog)
            }}
          >
            {showBattleLog ? <ScrollText size={16} /> : <Scroll size={16} />}
          </button>
        </div>
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
                      const { isActive, lastMove, justFainted } =
                        fighter.fighter
                      if (!isActive && !BIG_INACTIVE_FIGHTER && !justFainted)
                        return null
                      return (
                        <Fragment
                          key={fighter.catch?.id ?? fighter.wildlife.id}
                        >
                          <div
                            className={cn(
                              "rounded-full border border-dashed border-gray-200 bg-gray-100 px-4 py-1 text-xs text-black/60",
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
                                {lastMove ? (
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
                                )}
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
                              <FighterChip
                                fighter={fighter}
                                ltr={isMySide}
                                showAbsoluteHp={isMySide}
                                grayscale={!isActive && !justFainted}
                                onClick={() => {
                                  const catchId = fighter.catch?.id
                                  if (!catchId) return
                                  NiceModal.show(CatchDetailsModal, {
                                    catchId,
                                  })
                                }}
                              />
                              <div
                                className={cn(
                                  "my-1 flex flex-wrap gap-1",
                                  isMainSide ? "flex-row" : "flex-row-reverse"
                                )}
                              >
                                <FighterTypeBadges
                                  fighter={fighter}
                                  showTypes={SHOW_FIGHTER_TYPES}
                                  showAbility={SHOW_ABILITY}
                                  showNature={SHOW_NATURE}
                                />
                              </div>
                            </div>
                            {/* <div className="hidden flex-1 md:flex" /> */}
                            {(isMySide || SHOW_ENEMY_MOVES) &&
                              (isActive || SHOW_INACTIVE_MOVES) && (
                                <FighterMoves
                                  fighter={fighter}
                                  disabled={
                                    isLoading ||
                                    !isActive ||
                                    !isMySide ||
                                    !battleIsActive
                                  }
                                  onClick={({ moveIdx }) => {
                                    if (!playerId) return
                                    makeChoice({
                                      battleId,
                                      playerId: playerId,
                                      choice: `move ${moveIdx + 1}`,
                                    })
                                  }}
                                />
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

                          const { hp, hpMax } = fighter.fighter
                          const hpFull = hp >= hpMax
                          const dead = hp <= 0
                          return (
                            <Fragment key={fighterIdx}>
                              <button
                                title={getName(fighter.wildlife)}
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
                            {!pvpStatus.isPvp && (
                              <TypeBadge
                                size="big"
                                content="Catch"
                                icon={catchIcon}
                                onClick={() => {
                                  catchButton()
                                }}
                                className="w-[76px] sm:w-28"
                              />
                            )}
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
        {showBattleLog && (
          <div className="flex-1 border-l p-2 hidden lg:flex flex-col h-[400px]">
            <div className="overflow-auto" ref={logRef}>
              <div
                className="prose overflow-auto prose-sm"
                dangerouslySetInnerHTML={{ __html: battleLogAsHtml }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
