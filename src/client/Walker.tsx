import { useAtomValue } from "jotai"
import { Footprints } from "lucide-react"
import { useMemo } from "react"
import { Layer, Marker, Source } from "react-map-gl"
import { apiJotai } from "~/utils/api"

export const calcNavigationAtom =
  apiJotai.navigation.calcNavigation.atomWithMutation()

export const Walker = () => {
  const result = useAtomValue(calcNavigationAtom)

  const points = useMemo(() => {
    if (!result) return []
    const points = result.timingLegs.flatMap((leg, idx) => {
      const isLast = idx === result.timingLegs.length - 1
      if (isLast) {
        return [leg.from, leg.to]
      } else {
        return [leg.from]
      }
    })
    return points
  }, [result])

  const geoJson = useMemo(
    () =>
      points?.length
        ? {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: points.map((p) => [p.lng, p.lat]),
            },
          }
        : null,
    [points]
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
      {points.map((point, index) => {
        return (
          <Marker
            key={index}
            latitude={point.lat}
            longitude={point.lng}
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
