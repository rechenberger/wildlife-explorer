import { useAtomValue } from "jotai"
import { atomWithLocalStorage } from "~/utils/atomWithLocalStorage"

export const showFightersAtom = atomWithLocalStorage("showFighters", true)

export const useShowFighters = () => {
  const showFighters = useAtomValue(showFightersAtom)
  return showFighters
}
