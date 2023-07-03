import { ArrowLeftRight } from "lucide-react"
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
    <button
      onClick={() => toggle()}
      className="flex flex-row items-center gap-1 rounded border px-2 py-1 text-sm"
    >
      <ArrowLeftRight size={16} />
      {currentLocaleDefinition?.abbreviationLabel}
    </button>
  )
}
