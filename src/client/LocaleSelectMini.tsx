import { allLocaleDefinitions, useLocale, useSetLocale } from "./useLocale"

export const LocaleSelectMini = () => {
  const locale = useLocale()
  const setLocale = useSetLocale()

  const otherLocale = locale === "en" ? "de" : "en"

  const toggle = () => {
    setLocale(otherLocale)
  }

  const otherLocaleDefinition = allLocaleDefinitions.find(
    (l) => l.localeString === otherLocale
  )

  const currentLocaleDefinition = allLocaleDefinitions.find(
    (l) => l.localeString === locale
  )

  if (!otherLocaleDefinition) return null

  return (
    <button onClick={() => toggle()} className="text-sm">
      {currentLocaleDefinition?.abbreviationLabel}
    </button>
  )
}
