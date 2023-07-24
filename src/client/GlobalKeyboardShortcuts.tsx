import NiceModal from "@ebay/nice-modal-react"
import { AutoBattleModal } from "./AutoBattleModal"
import { TaxonFighterOverviewModal } from "./TaxonFighterOverviewModal"
import { TaxonOverviewModal } from "./TaxonOverviewModal"
import { useKeyboardShortcut } from "./useKeyboardShortcut"

export const GlobalKeyboardShortcuts = () => {
  useKeyboardShortcut("TAXON_OVERVIEW", () =>
    NiceModal.show(TaxonOverviewModal)
  )
  useKeyboardShortcut("FIGHTER_OVERVIEW", () =>
    NiceModal.show(TaxonFighterOverviewModal)
  )
  useKeyboardShortcut("AUTO_BATTLE", () => NiceModal.show(AutoBattleModal))
  return <></>
}
