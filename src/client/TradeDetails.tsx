import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export const TradeDetails = ({ tradeId }: { tradeId: string }) => {
  const { playerId } = usePlayer()
  const { data: trade } = api.trade.getById.useQuery(
    {
      tradeId,
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )
  return (
    <>
      <div>Trade</div>
      <pre>
        <code>{JSON.stringify(trade, null, 2)}</code>
      </pre>
    </>
  )
}
