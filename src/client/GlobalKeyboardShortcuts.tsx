import NiceModal from "@ebay/nice-modal-react"
import { useKeyboardShortcut } from "./useKeyboardShortcut"
import { TaxonOverviewModal } from "./TaxonOverviewModal"

export const GlobalKeyboardShortcuts = () => {
  useKeyboardShortcut("TAXON_OVERVIEW", () =>
    NiceModal.show(TaxonOverviewModal)
  )
  return <></>
}
