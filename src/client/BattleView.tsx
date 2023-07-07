import { find, map } from "lodash-es"
import { Undo2 } from "lucide-react"
import Image from "next/image"
import { Fragment } from "react"
import {
  DEV_MODE,
  MAX_FIGHTERS_PER_TEAM,
  MAX_MOVES_PER_FIGHTER,
} from "~/config"
import { api } from "~/utils/api"
import { cn } from "./cn"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { usePlayer } from "./usePlayer"

export const BattleView = () => {
  const { playerId } = usePlayer()

  const { data: battles } = api.battle.getMyBattles.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )

  const activeBattle = find(battles, (b) => b.status === "IN_PROGRESS")

  const { data: battleStatus } = api.battle.getBattleStatus.useQuery(
    {
      battleId: activeBattle?.id!,
      playerId: playerId!,
    },
    {
      enabled: !!activeBattle && !!playerId,
    }
  )

  const trpc = api.useContext()
  const { mutate: makeChoice } = api.battle.makeChoice.useMutation({
    onSuccess: () => {
      trpc.battle.invalidate()
    },
  })
  const { mutate: reset } = api.battle.reset.useMutation({
    onSuccess: () => {
      trpc.battle.invalidate()
    },
  })

  const getName = useGetWildlifeName()

  return (
    <div className="fixed bottom-0 left-0 z-50 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-white p-4 text-black shadow md:bottom-8 md:left-8 md:rounded-xl">
      {activeBattle ? (
        <>
          <div className="flex flex-row gap-2">
            <h3 className="flex-1 truncate text-2xl">Active Battle</h3>
            {DEV_MODE && (
              <button
                className="shrink-0"
                onClick={() => {
                  reset({
                    battleId: activeBattle.id,
                  })
                }}
              >
                <Undo2 size={16} />
              </button>
            )}
          </div>
          {/* <pre>{JSON.stringify(activeBattle, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(battleStatus, null, 2)}</pre> */}
          <div className="flex flex-col-reverse">
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
                    <div className="flex flex-col gap-6 self-stretch">
                      {map(side.fighters, (fighter, fighterIdx) => {
                        const { hp, hpMax, isActive, moves, status } =
                          fighter.fighterStatus
                        if (!isActive) return null
                        const hpFull = hp >= hpMax
                        const dead = hp <= 0
                        return (
                          <Fragment key={fighterIdx}>
                            <div
                              className={cn(
                                "flex items-center gap-2",
                                isMainSide ? "flex-row" : "flex-row-reverse"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex items-center gap-4 rounded-full bg-black/10 md:w-44",
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
                                      : dead
                                      ? "ring-red-500"
                                      : "ring-amber-400"
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
                                  <div className="truncate font-bold">
                                    {fighter.wildlife
                                      ? getName(fighter.wildlife)
                                      : fighter.fighter.name}
                                  </div>
                                  <div className="flex flex-row gap-1 text-xs">
                                    <div className="truncate">
                                      {hp}/{hpMax} HP
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
                              <div className="flex-1" />
                              {isMySide && (
                                <div className="grid grid-cols-2 gap-1">
                                  {map(
                                    fillWithNulls(moves, MAX_MOVES_PER_FIGHTER),
                                    (move, moveIdx) => {
                                      return (
                                        <button
                                          key={moveIdx}
                                          className={cn(
                                            "truncate rounded bg-black/10 px-2 py-1 text-xs",
                                            move ? "text-black" : "opacity-20"
                                          )}
                                          disabled={!move}
                                          onClick={() => {
                                            if (!move) return
                                            if (!playerId) return
                                            makeChoice({
                                              battleId: activeBattle.id,
                                              playerId: playerId,
                                              choice: `move ${moveIdx + 1}`,
                                            })
                                          }}
                                        >
                                          {move || "-"}
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
                        "flex items-center gap-1",
                        isMainSide ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      {map(
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
                                    battleId: activeBattle.id,
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
                    </div>
                    {/* <div className="text-xl">
                      {isMySide ? "You" : side.name}
                    </div> */}
                  </div>
                </Fragment>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <h3 className="truncate text-2xl">All Battles</h3>
          <div>{battles?.length || 0} Battles</div>
        </>
      )}
    </div>
  )
}

function fillWithNulls<T>(arr: T[], length: number) {
  const result: (T | null)[] = [...arr]
  while (result.length < length) {
    result.push(null)
  }
  return result
}
