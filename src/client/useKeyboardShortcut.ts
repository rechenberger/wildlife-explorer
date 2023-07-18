import { useEffect } from "react"
import { SHORTCUTS } from "~/config"

type ShortcutKey = keyof typeof SHORTCUTS
export const useKeyboardShortcut = (
  shortcutKey: ShortcutKey,
  callback: () => void
) => {
  const shortcut = SHORTCUTS[shortcutKey]
  const code = shortcut.code
  const shift = "shift" in shortcut && shortcut.shift
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      if (shift && !e.shiftKey) return
      if (e.code === code) {
        callback()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [callback, code, shift])
}
