import { useLayoutEffect, useState } from "react"
import ReactJson, { type ThemeKeys } from "react-json-view"

const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

const useIsDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(darkModeMediaQuery.matches)

  useLayoutEffect(() => {
    const handler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }
    darkModeMediaQuery.addEventListener("change", handler)
    return () => {
      darkModeMediaQuery.removeEventListener("change", handler)
    }
  }, [isDarkMode])

  return isDarkMode
}

export const JsonViewer = ({
  value,
  theme,
  collapsed = 1,
}: {
  value: any
  theme?: "dark" | "light"
  collapsed?: boolean | number
}) => {
  const isDarkMode = useIsDarkMode()
  const themeKey: ThemeKeys =
    theme === "dark"
      ? "ocean"
      : theme === "light"
      ? "rjv-default"
      : isDarkMode
      ? "ocean"
      : "rjv-default"
  return (
    <ReactJson
      key={theme}
      src={value}
      theme={themeKey}
      collapsed={collapsed}
      // style={{ backgroundColor: "transparent" }}
    />
  )
}

export default JsonViewer
