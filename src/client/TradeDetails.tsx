import NiceModal from "@ebay/nice-modal-react"
import { Fragment } from "react"
import { toast } from "sonner"
import { RouterInputs, api } from "~/utils/api"
import { FighterChip } from "./FighterChip"
import { MyCatchSelect } from "./MyCatchSelect"
import { TradeDetailsModal } from "./TradeDetailsModal"
import { TypeBadge } from "./TypeBadge"
import { cn } from "./cn"
import { Button } from "./shadcn/ui/button"
import { leaveIcon } from "./typeIcons"
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

  const { mutateAsync } = api.trade.updateTrade.useMutation()

  const updateTrade = async (
    input: Omit<RouterInputs["trade"]["updateTrade"], "tradeId" | "playerId">
  ) => {
    if (!playerId) return
    const promise = mutateAsync({
      tradeId,
      playerId,
      ...input,
    })
    toast.promise(promise, {
      loading: "Updating trade...",
      success: "Trade updated!",
      error: (err: any) => err?.message || "Error updating trade",
    })
    await promise
  }

  if (!trade) {
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )
  }

  const isPending = trade.status === "PENDING"

  return (
    <>
      <div>Trade {trade.status}</div>
      <div className="flex flex-row gap-4">
        {trade.sides.map((side) => {
          const isMySide = side.player.id === playerId
          return (
            <Fragment key={side.player.id}>
              <div className="flex flex-col gap-2 flex-1">
                <div>{side.player.name}</div>
                <div className="flex-1 flex flex-col gap-2">
                  {side.catches.map((c) => {
                    return (
                      <Fragment key={c.id}>
                        <div className="flex flex-row gap-2">
                          <FighterChip fighter={c} showAbsoluteHp={true} />
                        </div>
                      </Fragment>
                    )
                  })}
                  {isMySide && <MyCatchSelect />}
                </div>
                <Button
                  disabled={!isMySide || !isPending}
                  className={cn(side.accepted ? "bg-green-500" : "")}
                  onClick={() => {
                    updateTrade({
                      status: side.accepted ? "reject" : "accept",
                    })
                  }}
                >
                  {side.accepted ? "Accepted" : "Accept"}
                </Button>
              </div>
            </Fragment>
          )
        })}
      </div>
      <div className="flex flex-row justify-end">
        <TypeBadge
          icon={leaveIcon}
          content={isPending ? "Cancel" : "Close"}
          onClick={() => {
            if (isPending) {
              updateTrade({
                status: "cancel",
              })
            }
            NiceModal.hide(TradeDetailsModal)
          }}
        />
      </div>
    </>
  )
}
