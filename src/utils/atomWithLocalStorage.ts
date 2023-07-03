import { atom } from "jotai"

// FROM: https://jotai.org/docs/guides/persistence#a-helper-function-with-localstorage-and-json-parse
export const atomWithLocalStorage = <T>(key: string, initialValue: T) => {
  const getInitialValue = () => {
    const item =
      typeof localStorage !== "undefined" ? localStorage.getItem(key) : null
    if (item !== null) {
      return JSON.parse(item) as T
    }
    return initialValue
  }
  const baseAtom = atom(getInitialValue())
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === "function" ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)
      localStorage.setItem(key, JSON.stringify(nextValue))
    }
  )
  return derivedAtom
}
