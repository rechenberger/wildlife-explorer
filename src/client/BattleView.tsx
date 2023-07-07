import { find, map } from "lodash-es"
import Image from "next/image"
import { Fragment } from "react"
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

  const getName = useGetWildlifeName()

  return (
    <div className="fixed bottom-0 left-0 z-50 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-white p-4 text-black shadow md:bottom-8 md:left-8 md:rounded-xl">
      {activeBattle ? (
        <>
          <h3 className="truncate text-2xl">Active Battle</h3>
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
                        const { hp, hpMax, isActive, moves } =
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
                                  "flex w-44 items-center gap-4 rounded-full bg-black/10",
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
                                  <div className="truncate">
                                    {hp}/{hpMax} HP
                                  </div>
                                </div>
                                <div className="w-2" />
                              </div>
                              <div className="flex-1" />
                              <div className="grid grid-cols-2 gap-1">
                                {map(fillWithNulls(moves, 4), (move, idx) => {
                                  return (
                                    <button
                                      key={idx}
                                      className={cn(
                                        "rounded bg-black/10 px-2 py-1 text-xs",
                                        move ? "text-black" : "opacity-20"
                                      )}
                                      disabled={!move}
                                    >
                                      {move || "-"}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </Fragment>
                        )
                      })}
                    </div>
                    <div className="flex flex-row gap-1">
                      {map(side.fighters, (fighter, fighterIdx) => {
                        const { hp, hpMax } = fighter.fighterStatus
                        const hpFull = hp >= hpMax
                        const dead = hp <= 0
                        return (
                          <Fragment key={fighterIdx}>
                            <div
                              className={cn(
                                "relative aspect-square h-4 w-4 overflow-hidden rounded-full border-2",
                                hpFull
                                  ? "border-green-500"
                                  : dead
                                  ? "border-red-500"
                                  : "border-amber-400"
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
                          </Fragment>
                        )
                      })}
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
