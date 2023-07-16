// mapbox://styles/mapbox/streets-v9
// mapbox://styles/mapbox/dark-v10
// mapbox://styles/mapbox/outdoors-v12
// mapbox://styles/mapbox/satellite-v9
// mapbox://styles/mapbox/satellite-streets-v12
// mapbox://styles/rechenberger/cljkelien006n01o429b9440e
// mapbox://styles/rechenberger/cljklaom7007001r5hfwlcrfu

import { useAtom } from "jotai"
import { useMemo } from "react"
import { atomWithLocalStorage } from "~/utils/atomWithLocalStorage"

const mapStyleOptions = [
  {
    key: "outdoors",
    label: "Outdoors",
    mapboxUrl: "mapbox://styles/mapbox/outdoors-v12",
  },
  // {
  //   key: "streets",
  //   label: "Streets",
  //   mapboxUrl: "mapbox://styles/mapbox/streets-v9",
  // },
  {
    key: "dark",
    label: "Dark",
    mapboxUrl: "mapbox://styles/mapbox/dark-v10",
  },
  {
    key: "satellite",
    label: "Satellite",
    mapboxUrl: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  {
    key: "satellite-pure",
    label: "Satellite Pure",
    mapboxUrl: "mapbox://styles/mapbox/satellite-v9",
  },
]

const mapStyleDefault = mapStyleOptions[0]!

const settingsMapStyle = atomWithLocalStorage(
  "settingsMapStyle",
  mapStyleDefault.key
)

export const useSettingsMapStyle = () => {
  const [mapStyleKey, setMapStyleKey] = useAtom(settingsMapStyle)
  const mapStyle = useMemo(
    () =>
      mapStyleOptions.find((option) => option.key === mapStyleKey) ||
      mapStyleDefault,
    [mapStyleKey]
  )
  return { mapStyleOptions, mapStyle, mapStyleKey, setMapStyleKey }
}
