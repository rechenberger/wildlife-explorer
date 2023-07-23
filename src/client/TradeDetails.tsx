import NiceModal from "@ebay/nice-modal-react"
import { Plus, X } from "lucide-react"
import { Fragment } from "react"
import { toast } from "sonner"
import { api, type RouterInputs } from "~/utils/api"
import { CatchDetailsModal } from "./CatchDetailsModal"
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
  const { data: trade, refetch: refetchTrade } = api.trade.getById.useQuery(
    {
      tradeId,
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      refetchInterval: 1000,
    }
  )

  const trpc = api.useContext()
  const { mutateAsync, isLoading: updating } =
    api.trade.updateTrade.useMutation({
      onSettled: () => {
        trpc.catch.invalidate()
      },
    })

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
    try {
      await promise
    } catch (e) {
    } finally {
      await refetchTrade()
    }
  }

  if (!trade) {
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )
  }

  const isPending = trade.status === "PENDING"
  const disabled = !isPending || updating

  return (
    <>
      <div>Trade {trade.status}</div>
      <div className="flex flex-row gap-4">
        {trade.sides.map((side, idx) => {
          const isMySide = side.player.id === playerId
          const isLeft = idx === 0
          return (
            <Fragment key={side.player.id}>
              <div className="flex flex-col gap-2 flex-1">
                <div>{side.player.name}</div>
                <div className="flex-1 flex flex-col gap-3">
                  {side.catches.map((c) => {
                    return (
                      <Fragment key={c.id}>
                        <div className="flex flex-row gap-2">
                          <div className="flex-1">
                            <FighterChip
                              fighter={c}
                              showAbsoluteHp={true}
                              ltr={isLeft}
                              onClick={
                                isMySide
                                  ? () => {
                                      NiceModal.show(CatchDetailsModal, {
                                        catchId: c.id,
                                      })
                                    }
                                  : undefined
                              }
                            />
                          </div>
                          {isMySide && (
                            <button
                              disabled={disabled}
                              onClick={() => {
                                updateTrade({
                                  removeCatchId: c.id,
                                })
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </Fragment>
                    )
                  })}
                  {isMySide && (
                    <MyCatchSelect
                      onSelect={(c) => {
                        updateTrade({
                          addCatchId: c.id,
                        })
                      }}
                    >
                      <Button disabled={disabled}>
                        <Plus className="w-4 h-4 mr-1" />
                        <span>Add</span>
                      </Button>
                    </MyCatchSelect>
                  )}
                </div>
                <Button
                  disabled={!isMySide || disabled}
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
            } else {
              NiceModal.hide(TradeDetailsModal)
            }
          }}
        />
      </div>
    </>
  )
}
