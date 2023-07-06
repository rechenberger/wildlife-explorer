import * as turf from "@turf/turf"
import { useAtomValue } from "jotai"
import { Layer, Source } from "react-map-gl"
import {
  RADIUS_IN_KM_SEE_WILDLIFE_BIG,
  RADIUS_IN_KM_SEE_WILDLIFE_SMALL,
} from "~/config"
import { scanningLocationAtom } from "./ScanButton"

export const ScanCircle = () => {
  const location = useAtomValue(scanningLocationAtom)
  if (!location) return null
  const centerCoordinates = [location.lng, location.lat] // Example coordinates
  const circles = [
    RADIUS_IN_KM_SEE_WILDLIFE_SMALL,
    RADIUS_IN_KM_SEE_WILDLIFE_BIG,
  ]

  return (
    <>
      {circles.map((radius) => (
        <Source
          key={radius}
          type="geojson"
          data={turf.circle(centerCoordinates, radius, {
            steps: 100,
            units: "kilometers",
          })}
        >
          <Layer
            type="fill"
            paint={{
              "fill-color": "rgba(96, 165, 250, 0.2)", // Semi-transparent blue
              "fill-outline-color": "blue", // Blue outline
            }}
          />
        </Source>
      ))}
    </>
  )
}

export default Map
