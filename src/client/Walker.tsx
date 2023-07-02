import { useAtomValue } from "jotai"
import { Footprints } from "lucide-react"
import { useMemo } from "react"
import { Layer, Marker, Source } from "react-map-gl"
import { apiJotai } from "~/utils/api"

export const calcNavigationAtom =
  apiJotai.navigation.calcNavigation.atomWithMutation()

export const Walker = () => {
  const result = useAtomValue(calcNavigationAtom)

  const geoJson = useMemo(
    () =>
      result
        ? {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: result.timingLegs.map((leg) => [
                leg.from.lng,
                leg.from.lat,
              ]),
            },
          }
        : null,
    [result]
  )

  if (!result) return null

  return (
    <>
      <Source id="route" type="geojson" data={geoJson}>
        <Layer
          id="route"
          type="line"
          source="route"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#60a5fa",
            "line-width": 8,
          }}
        />
      </Source>
      {result.timingLegs.map((leg, index) => {
        return (
          <Marker
            key={index}
            latitude={leg.from.lat}
            longitude={leg.from.lng}
            anchor="center"
          >
            <div className="relative aspect-square rounded-full border border-white bg-blue-500 p-0.5">
              <Footprints size={8} className="animate text-white" />
              {/* <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-blue-400" /> */}
            </div>
          </Marker>
        )
      })}
    </>
  )
}
