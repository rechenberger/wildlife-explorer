import NiceModal from "@ebay/nice-modal-react"
import { useEffect } from "react"
import { REFETCH_MS_LATEST_TRADE } from "~/config"
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
      refetchInterval: REFETCH_MS_LATEST_TRADE,
    }
  )
  const tradeId = trade?.id
  useEffect(() => {
    if (!tradeId) return
    NiceModal.show(TradeDetailsModal, { tradeId })
  }, [tradeId])
}
