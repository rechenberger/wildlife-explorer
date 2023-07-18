import { useEffect } from "react"
import { SHORTCUTS } from "~/config"

type ShortcutKey = keyof typeof SHORTCUTS
export const useKeyboardShortcut = (
  shortcutKey: ShortcutKey,
  callback: () => void
) => {
  const key = SHORTCUTS[shortcutKey]
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      if (e.key === key) {
        callback()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [callback, key])
}
