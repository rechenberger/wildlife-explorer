import dynamic from "next/dynamic"
import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

const JsonViewer = dynamic(() => import("./JsonViewer"), { ssr: false })

export const BattleOverview = () => {
  const { playerId } = usePlayer()
  const { data: battles } = api.battle.getMyBattles.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  return (
    <>
      <div>Battles</div>
      <JsonViewer value={battles} />
    </>
  )
}
