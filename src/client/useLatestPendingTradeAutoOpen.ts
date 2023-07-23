import NiceModal from "@ebay/nice-modal-react"
import { useEffect } from "react"
import { api } from "~/utils/api"
import { TradeDetailsModal } from "./TradeDetailsModal"
import { usePlayer } from "./usePlayer"
import { REFETCH_MS_LATEST_TRADE } from "~/config"

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
  useEffect(() => {
    if (!trade) return
    NiceModal.show(TradeDetailsModal, { tradeId: trade.id })
  }, [trade])
}
