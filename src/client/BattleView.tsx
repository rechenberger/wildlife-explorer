import { find, map } from "lodash-es"
import Image from "next/image"
import { Fragment } from "react"
import { api } from "~/utils/api"
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
            return (
              <Fragment key={sideIdx}>
                <div>{side.name}</div>
                <>
                  {map(side.fighters, (fighter, fighterIdx) => {
                    return (
                      <Fragment key={fighterIdx}>
                        <div className="flex flex-row gap-2">
                          <div className="relative aspect-square h-12 w-12 overflow-hidden rounded-full ring ring-amber-400">
                            {fighter.wildlife.metadata.taxonImageUrlSquare && (
                              <Image
                                src={
                                  fighter.wildlife.metadata.taxonImageUrlSquare
                                }
                                className="w-full object-cover object-center"
                                alt={"Observation"}
                                unoptimized
                                fill={true}
                              />
                            )}
                          </div>
                          <div>
                            <div>
                              {fighter.wildlife
                                ? getName(fighter.wildlife)
                                : fighter.fighter.name}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    )
                  })}
                </>
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
