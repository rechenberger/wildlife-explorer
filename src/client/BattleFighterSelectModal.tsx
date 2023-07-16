import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { type BattleReportFighter } from "~/server/lib/battle/BattleReport"
import { BattleFighterSelect } from "./BattleFighterSelect"
import { cn } from "./cn"
import { Dialog, DialogContent } from "./shadcn/ui/dialog"
import { ScrollArea } from "./shadcn/ui/scroll-area"

export const BattleFighterSelectModal = NiceModal.create<{
  fighters: BattleReportFighter[]
  battleId: string
}>(({ fighters, battleId }) => {
  // Use a hook to manage the modal state
  const modal = useModal()

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(open) => {
        if (!open) {
          modal.reject()
          modal.remove()
        }
      }}
    >
      <DialogContent
        className={cn(
          "border-0 bg-white pt-3",
          "rounded-t-lg max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:p-4 max-sm:pt-3"
        )}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <ScrollArea className="max-h-[calc(100svh-100px)]">
          <BattleFighterSelect fighters={fighters} battleId={battleId} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
})