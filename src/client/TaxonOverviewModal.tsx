import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { TaxonOverview } from "./TaxonOverview"
import { cn } from "./cn"
import { Dialog, DialogContent } from "./shadcn/ui/dialog"

export const TaxonOverviewModal = NiceModal.create<{
  taxonId: number
}>(({ taxonId }) => {
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
          "rounded-t-lg max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:p-4 max-sm:pt-3",
          "max-h-[calc(100svh-100px)] overflow-auto"
        )}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
        }}
      >
        <TaxonOverview taxonId={taxonId} />
      </DialogContent>
    </Dialog>
  )
})
