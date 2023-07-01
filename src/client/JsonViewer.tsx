import { useLayoutEffect, useState, type FunctionComponent } from "react"
import ReactJson, { type ThemeKeys } from "react-json-view"

export type JsonViewerProps = {
  value: any
}

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

export const JsonViewer: FunctionComponent<JsonViewerProps> = ({ value }) => {
  const isDarkMode = useIsDarkMode()
  const theme: ThemeKeys = isDarkMode ? "ocean" : "rjv-default"
  return (
    <ReactJson
      key={theme}
      src={value}
      theme={theme}
      collapsed={true}
      style={{ backgroundColor: "transparent" }}
    />
  )
}

export default JsonViewer
