import NiceModal from "@ebay/nice-modal-react"
import { useEffect } from "react"
import { api } from "~/utils/api"
import { TradeDetailsModal } from "./TradeDetailsModal"
import { usePlayer } from "./usePlayer"

export const useLatestPendingTradeAutoOpen = () => {
  const { playerId } = usePlayer()
  const { data: trade } = api.trade.getLatestPending.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      refetchInterval: 1000,
    }
  )
  useEffect(() => {
    if (!trade) return
    NiceModal.show(TradeDetailsModal, { tradeId: trade.id })
  }, [trade])
}
