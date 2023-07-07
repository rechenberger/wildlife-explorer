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
          {map(battleStatus?.sides, (side, sideIdx) => {
            const isMySide = side.player?.id === playerId
            return (
              <Fragment key={sideIdx}>
                {sideIdx > 0 && (
                  <div className="flex flex-row items-center gap-2">
                    <hr className="flex-1" />
                    <div className="opacity-50">vs</div>
                    <hr className="flex-1" />
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  <div className="text-xl">{isMySide ? "You" : side.name}</div>
                  <div className="flex flex-col gap-6">
                    {map(side.fighters, (fighter, fighterIdx) => {
                      const { hp, hpMax } = fighter.fighterStatus
                      const hpFull = hp >= hpMax
                      const dead = hp <= 0
                      return (
                        <Fragment key={fighterIdx}>
                          <div
                            className={cn(
                              "flex flex-row items-center gap-4 rounded-full bg-black/10"
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
                                "relative -m-1 aspect-square h-12 w-12 overflow-hidden rounded-full ring",
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
                            <div className="py-1">
                              <div className="font-bold">
                                {fighter.wildlife
                                  ? getName(fighter.wildlife)
                                  : fighter.fighter.name}
                              </div>
                              <div>
                                {hp}/{hpMax} HP
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      )
                    })}
                  </div>
                </div>
              </Fragment>
            )
          })}
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
