import { useAtomValue } from "jotai"
import { SHOW_FIGHTERS_DEFAULT } from "~/config"
import { atomWithLocalStorage } from "~/utils/atomWithLocalStorage"

export const showFightersAtom = atomWithLocalStorage(
  "showFighters",
  SHOW_FIGHTERS_DEFAULT
)

export const useShowFighters = () => {
  const showFighters = useAtomValue(showFightersAtom)
  return showFighters
}
