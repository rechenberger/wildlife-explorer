import NiceModal from "@ebay/nice-modal-react"
import { useAtomValue, useSetAtom } from "jotai"
import { find, flatMap, map, orderBy } from "lodash-es"
import { Scroll, ScrollText, Undo2 } from "lucide-react"
import Image from "next/image"
import { Fragment, useCallback, useLayoutEffect, useRef } from "react"
import { toast } from "sonner"
import {
  DEV_MODE,
  FIGHTER_MAX_NUM_WITH_BACK_IMG,
  REFETCH_MS_BATTLE_PVP,
} from "~/config"
import { parseBattleLog } from "~/server/lib/battle/battleLogParser"
import { api } from "~/utils/api"
import { atomWithLocalStorage } from "~/utils/atomWithLocalStorage"
import { BattleFighterSelectButton } from "./BattleFighterSelectButton"
import { BattleViewPvp } from "./BattleViewPvp"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { FighterChip } from "./FighterChip"
import { FighterMoves } from "./FighterMoves"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { TypeBadge } from "./TypeBadge"
import { cn } from "./cn"
import { getFighterImage } from "./getFighterImage"
import {
  catchIcon,
  leaveIcon,
  loserIcon,
  readyIcon,
  runIcon,
  winnerIcon,
} from "./typeIcons"
import { useCatch } from "./useCatch"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { useKeyboardShortcut } from "./useKeyboardShortcut"
import { useMakeChoice } from "./useMakeChoice"
import { usePlayer } from "./usePlayer"
import { useShowFighters } from "./useShowFighter"

const BIG_INACTIVE_FIGHTER = false
const SHOW_ENEMY_MOVES = DEV_MODE
const SHOW_INACTIVE_MOVES = true
const SHOW_FIGHTER_TYPES = true
const SHOW_ABILITY = DEV_MODE
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
      }
    )

  const {
    data,
    isFetching: battleLoading,
    error,
  } = api.battle.getBattleStatus.useQuery(
    {
      battleId,
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      // onSuccess: (data) => {
      //   console.log(data)
      // },
      refetchInterval: pvpStatus?.isPvp ? REFETCH_MS_BATTLE_PVP : undefined,
    }
  )

  const battleLogAsHtml = parseBattleLog(data?.battleReport.outputLog, true)
  const trpc = api.useContext()
  const { mutate: makeChoice, isLoading: choiceLoading } = useMakeChoice()
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

  const ezChoice = useCallback(
    (choice: string) => {
      if (!playerId) return
      return makeChoice({
        battleId,
        playerId: playerId,
        choice,
      })
    },
    [battleId, makeChoice, playerId]
  )

  useKeyboardShortcut("MOVE_1", () => ezChoice("move 1"))
  useKeyboardShortcut("MOVE_2", () => ezChoice("move 2"))
  useKeyboardShortcut("MOVE_3", () => ezChoice("move 3"))
  useKeyboardShortcut("MOVE_4", () => ezChoice("move 4"))
  useKeyboardShortcut("SWITCH_1", () => ezChoice("switch 1"))
  useKeyboardShortcut("SWITCH_2", () => ezChoice("switch 2"))
  useKeyboardShortcut("SWITCH_3", () => ezChoice("switch 3"))
  useKeyboardShortcut("SWITCH_4", () => ezChoice("switch 4"))
  useKeyboardShortcut("SWITCH_5", () => ezChoice("switch 5"))
  useKeyboardShortcut("SWITCH_6", () => ezChoice("switch 6"))

  const isLoading = pvpStatus?.isPvp
    ? false
    : battleLoading || choiceLoading || pvpStatusLoading

  const getName = useGetWildlifeName()

  const { doCatch } = useCatch({
    battleId,
  })

  const showFighters = useShowFighters()

  const logRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!logRef.current) return
    logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battleLogAsHtml, showBattleLog])

  if (!data || !pvpStatus || error) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center py-48 text-center text-sm">
        <div className="opacity-60">{error ? error.message : "Loading..."}</div>
        {!!error && (
          <TypeBadge
            size="big"
            content="Try Running"
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
        )}
      </div>
    )
  }

  if (pvpStatus.status === "INVITING") {
    return <BattleViewPvp battleId={battleId} />
  }

  const { battleReport, status } = data

  const battleIsActive = status === "IN_PROGRESS"

  const catchButton = () => {
    if (!playerId) return

    // Find un-caught wildlife
    const wildlifeId = find(
      flatMap(battleReport.sides, (s) => s.fighters),
      (f) => !f.catch
    )?.wildlife?.id

    if (!wildlifeId) {
      toast.error("No wildlife to catch")
      return
    }
    doCatch({ wildlifeId })
  }

  const sides = orderBy(battleReport?.sides, (s) =>
    s.player?.id === playerId ? 0 : 1
  )

  return (
    <>
      <div className="flex flex-row gap-2">
        <h3 className="flex-1">
          {data.dungeon ? (
            <div className="flex flex-row gap-1">
              <strong>{data.dungeon.name}</strong>
              <span>Dungeon</span>
              <span>Tier</span>
              <strong>#{data.dungeon.tier}</strong>
            </div>
          ) : (
            <span>{battleIsActive ? "Active Battle" : "Past Battle"}</span>
          )}
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
          {map(sides, (side, sideIdx) => {
            const isMySide = side.player?.id === playerId
            const isMainSide = sideIdx === 0
            const isChoiceDone = find(
              data.battleReport.battlePlayerChoices,
              (pc) => pc.playerId === side.player?.id
            )?.isChoiceDone
            const isWinner = side.isWinner
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
                    {map(side.fighters, (fighter, fighterIdx) => {
                      const { isActive, lastMove, justFainted } =
                        fighter.fighter
                      if (!isActive && !BIG_INACTIVE_FIGHTER && !justFainted)
                        return null
                      return (
                        <Fragment
                          key={
                            fighter.catch?.id ??
                            fighter.wildlife?.id ??
                            fighterIdx
                          }
                        >
                          {isActive && showFighters && (
                            <div
                              className={cn(
                                "flex flex-row items-center gap-2 px-8",
                                isMainSide ? "flex-row" : "flex-row-reverse"
                              )}
                            >
                              <Image
                                src={getFighterImage({
                                  fighterSpeciesNum: fighter.fighter.speciesNum,
                                  back: isMainSide,
                                  animated: true,
                                })}
                                width={40}
                                height={40}
                                alt={"Fighter"}
                                className={cn(
                                  "scale-[2]",
                                  isMainSide &&
                                    fighter.fighter.speciesNum >
                                      FIGHTER_MAX_NUM_WITH_BACK_IMG &&
                                    "transform scale-x-[-2]"
                                )}
                                unoptimized
                              />
                            </div>
                          )}
                          {isActive && (
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
                                    {getName(fighter)}
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
                          )}
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
                                showAbsoluteHp={isMySide || DEV_MODE}
                                grayscale={!isActive && !justFainted}
                                onClick={
                                  isMySide && !!fighter.catch?.id
                                    ? () => {
                                        const catchId = fighter.catch?.id
                                        if (!catchId) return
                                        NiceModal.show(CatchDetailsModal, {
                                          catchId,
                                        })
                                      }
                                    : undefined
                                }
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
                                {pvpStatus.status === "IN_PROGRESS" ? (
                                  <>
                                    {pvpStatus.isPvp && (
                                      <TypeBadge
                                        icon={readyIcon}
                                        content="Ready!"
                                        className={cn(
                                          isChoiceDone
                                            ? "opacity-100 animate-pulse"
                                            : "opacity-0"
                                        )}
                                      />
                                    )}
                                  </>
                                ) : pvpStatus.status === "FINISHED" ? (
                                  <>
                                    <TypeBadge
                                      icon={isWinner ? winnerIcon : loserIcon}
                                      content={isWinner ? "Won" : "Defeated"}
                                    />
                                  </>
                                ) : null}
                              </div>
                            </div>
                            {/* <div className="hidden flex-1 md:flex" /> */}
                            {(isMySide || SHOW_ENEMY_MOVES) &&
                              (isActive || SHOW_INACTIVE_MOVES) && (
                                <FighterMoves
                                  fighter={fighter}
                                  hideMobileDetails
                                  disabled={
                                    isLoading ||
                                    !isActive ||
                                    !isMySide ||
                                    !battleIsActive ||
                                    !!isChoiceDone
                                  }
                                  onClick={({ moveId }) => {
                                    if (!playerId) return
                                    makeChoice({
                                      battleId,
                                      playerId: playerId,
                                      choice: `move ${moveId}`,
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
                      "flex w-full items-center gap-3",
                      isMainSide ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    <BattleFighterSelectButton
                      side={side}
                      isMainSide={isMainSide}
                      isMySide={isMySide}
                      battleIsActive={battleIsActive}
                      battleId={battleId}
                    />
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
