import { useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { z } from "zod"
import { atomWithLocalStorage } from "~/utils/atomWithLocalStorage"

const LOCAL_STORAGE_KEY = "locale"
const DEFAULT_LOCALE = "en" as const

const allLocales = ["en", "de"] as const
export const localeSchema = z.enum(allLocales)
export type LocaleString = z.infer<typeof localeSchema>

export const localeAtom = atomWithLocalStorage<LocaleString | null>(
  LOCAL_STORAGE_KEY,
  null
)

const getLocaleWithFallback = (locale: string | null): LocaleString => {
  const parsedLocale = localeSchema.safeParse(locale)
  if (parsedLocale.success) return parsedLocale.data

  // Try auto-detecting locale
  // https://teampilot.ai/team/sodefa/chat/clitzs7w10001l708kma0htw1
  if (typeof navigator !== "undefined") {
    const language = navigator.language
    if (language && language.startsWith("de")) return "de"
  }

  return DEFAULT_LOCALE
}

export const allLocaleDefinitions = [
  {
    localeString: "en",
    nativeName: "English",
    // flagEmoji: '🇺🇸',
    abbreviationLabel: "EN",
    actionLabel: "Change language to English",
  },
  {
    localeString: "de",
    nativeName: "Deutsch",
    // flagEmoji: '🇩🇪',
    abbreviationLabel: "DE",
    actionLabel: "Sprache zu Deutsch wechseln",
  },
] as const

export const useLocaleLoaded = () => {
  const [localeLoaded, setLocaleLoaded] = useState(false)
  useEffect(() => {
    setLocaleLoaded(true)
  }, [])
  return localeLoaded
}

export const useLocale = () => {
  const atomValue = useAtomValue(localeAtom)
  const localeString = getLocaleWithFallback(atomValue)
  const loaded = useLocaleLoaded()

  return loaded ? localeString : DEFAULT_LOCALE
}

export const useSetLocale = () => {
  return useSetAtom(localeAtom)
}
