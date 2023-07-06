import { useAtomValue } from "jotai"
import { filter, last } from "lodash-es"
import { Footprints } from "lucide-react"
import { useMemo } from "react"
import { Layer, Marker, Source } from "react-map-gl"
import { calcTimingLegs } from "~/server/lib/calcTimingLegs"
import { type RouterOutputs } from "~/utils/api"
import { playerLocationAtom } from "./PlayerMarker"
import { cn } from "./cn"

const SHOW_FOOTSTEPS = false

type Player =
  | RouterOutputs["player"]["getMe"]
  | RouterOutputs["player"]["others"][number]

export const PlayerRoute = ({
  player,
  isMe,
}: {
  player: Player
  isMe?: boolean
}) => {
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
    if (isMe) {
      points = [playerLocation, ...points]
    }
    points = [...points, lastPoint]
    return points
  }, [isMe, playerLocation, result])

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
            "line-color": isMe ? "#60a5fa" : "#a855f7",
            "line-opacity": isMe ? 1 : 0.5,
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
              <div
                className={cn(
                  "relative aspect-square rounded-full border border-white p-0.5",
                  isMe ? "bg-blue-500" : "bg-purple-500 opacity-50"
                )}
              >
                <Footprints size={8} className="animate text-white" />
                {/* <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-blue-400" /> */}
              </div>
            </Marker>
          )
        })}
    </>
  )
}
