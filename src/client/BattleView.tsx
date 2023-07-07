import { find } from "lodash-es"
import { api } from "~/utils/api"
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

  return (
    <div className="fixed bottom-0 left-0 z-50 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-white p-4 text-black shadow md:bottom-8 md:left-8 md:rounded-xl">
      {activeBattle ? (
        <>
          <h3 className="truncate text-2xl">Active Battle</h3>
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
