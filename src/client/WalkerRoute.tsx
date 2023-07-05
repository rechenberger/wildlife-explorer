import { useAtomValue } from "jotai"
import { filter, last } from "lodash-es"
import { Footprints } from "lucide-react"
import { useMemo } from "react"
import { Layer, Marker, Source } from "react-map-gl"
import { calcTimingLegs } from "~/server/lib/calcTimingLegs"
import { apiJotai } from "~/utils/api"
import { playerLocationAtom } from "./WalkerMarker"
import { usePlayer } from "./usePlayer"

export const calcNavigationAtom =
  apiJotai.navigation.calcNavigation.atomWithMutation()

const SHOW_FOOTSTEPS = false

export const WalkerRoute = () => {
  const { player } = usePlayer()
  const result = useMemo(
    () =>
      player?.metadata?.navigation
        ? calcTimingLegs(player?.metadata?.navigation)
        : null,
    [player?.metadata?.navigation]
  )
  const playerLocation = useAtomValue(playerLocationAtom)
  const points = useMemo(() => {
    if (!result) return []
    let points = filter(
      result.timingLegs,
      (leg) => leg.startingAtTimestamp > Date.now()
    ).map((leg) => leg.from)
    const lastPoint = last(result.timingLegs)?.to
    if (!lastPoint) return []
    points = [playerLocation, ...points, lastPoint]
    return points
  }, [playerLocation, result])

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
      {SHOW_FOOTSTEPS &&
        points.map((point, index) => {
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
