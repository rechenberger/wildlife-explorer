import * as turf from "@turf/turf"
import { useAtomValue } from "jotai"
import { Layer, Source } from "react-map-gl"
import { scanningLocationAtom } from "./ScanButton"

export const ScanCircle = () => {
  const location = useAtomValue(scanningLocationAtom)
  if (!location) return null
  const centerCoordinates = [location.lng, location.lat] // Example coordinates
  const radius = 0.5 // Radius in km

  // Generate a circle polygon using Turf.js
  const circle = turf.circle(centerCoordinates, radius, {
    steps: 100,
    units: "kilometers",
  })

  return (
    <Source type="geojson" data={circle}>
      <Layer
        type="fill"
        paint={{
          "fill-color": "rgba(96, 165, 250, 0.2)", // Semi-transparent blue
          "fill-outline-color": "blue", // Blue outline
        }}
      />
    </Source>
  )
}

export default Map
