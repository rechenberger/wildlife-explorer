import * as turf from "@turf/turf"
import { debounce } from "lodash-es"
import { Footprints, Loader2, User2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Layer, Map, Marker, Source } from "react-map-gl"
import { env } from "~/env.mjs"
import { api } from "~/utils/api"

import * as polyline from "@mapbox/polyline"

const geometry = "e~yuHwohi@Ff@kFpCYEgCpA}A^QzAAp@NfEHd@UJh@xF"
const decodedGeometry = polyline.decode(geometry)

console.log("decodedGeometry", decodedGeometry)

const totalDuration = 328
// Calculate the total distance of the path in meters
let totalDistance = 0
for (let i = 0; i < decodedGeometry.length - 1; i++) {
  const from = turf.point(decodedGeometry[i]!)
  const to = turf.point(decodedGeometry[i + 1]!)
  const distance = turf.distance(from, to) * 1000 // convert to meters
  // console.log("distance", distance)
  totalDistance += distance
}

// Calculate the duration for each segment
const durations = []
for (let i = 0; i < decodedGeometry.length - 1; i++) {
  const from = turf.point(decodedGeometry[i]!)
  const to = turf.point(decodedGeometry[i + 1]!)
  const distance = turf.distance(from, to) * 1000 // convert to meters
  const duration = (distance / totalDistance) * totalDuration // distribute the total duration
  durations.push(duration)
}

console.log("durations", durations)

const geojson = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: decodedGeometry.map((point) => [point[1], point[0]]), // flip lat and lon
  },
}

function calculateRadiusFromZoomLevel(zoomLevel: number): number {
  const earthCircumferenceKm = 40075.017
  const radiusAtZoom0 = earthCircumferenceKm / 1
  return radiusAtZoom0 / Math.pow(2, zoomLevel)
}

export default function Page() {
  const [center, setCenter] = useState({
    lat: 50.928435947011906,
    lng: 6.930087265110956,
    radiusInKm: 0.5,
  })

  const { data, isFetching } = api.wildlife.find.useQuery(center, {
    keepPreviousData: true,
  })

  const { mutateAsync: calcNavigation } =
    api.navigation.calcNavigation.useMutation()

  const setCenterDebounced = useMemo(() => {
    return debounce(
      (newCenter: { lat: number; lng: number; radiusInKm: number }) => {
        setCenter(newCenter)
      },
      100
    )
  }, [])

  return (
    <>
      <main className="relative flex h-[100svh] w-full">
        {isFetching && (
          <div className="absolute right-2 top-2 z-50 animate-spin opacity-60">
            <Loader2 />
          </div>
        )}
        <Map
          mapLib={import("mapbox-gl")}
          initialViewState={{
            latitude: 50.928435947011906,
            longitude: 6.930087265110956,
            pitch: 45,
            zoom: 15,
          }}
          style={{ width: "100%", height: "100%" }}
          // mapStyle="mapbox://styles/mapbox/streets-v9"
          mapStyle="mapbox://styles/rechenberger/cljkelien006n01o429b9440e"
          mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
          onMove={(e) => {
            setCenterDebounced({
              lat: e.viewState.latitude,
              lng: e.viewState.longitude,
              radiusInKm: calculateRadiusFromZoomLevel(e.viewState.zoom),
            })
          }}
        >
          <Source id="route" type="geojson" data={geojson}>
            <Layer
              id="route"
              type="line"
              source="route"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#888",
                "line-width": 8,
              }}
            />
          </Source>
          {decodedGeometry.map((point, index) => {
            return (
              <Marker
                key={index}
                latitude={point[0]}
                longitude={point[1]}
                anchor="bottom"
              >
                <div className="relative aspect-square rounded-full border-2 bg-blue-500 ring-2 ring-blue-400">
                  <Footprints size={24} className="animate text-white" />
                  <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-blue-400" />
                </div>
              </Marker>
            )
          })}
          <Marker
            latitude={50.928435947011906}
            longitude={6.930087265110956}
            anchor="bottom"
          >
            <div className="relative aspect-square rounded-full border-2 bg-blue-500 ring-2 ring-blue-400">
              <User2 size={24} className="animate text-white" />
              <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-blue-400" />
            </div>
          </Marker>
          {data?.results.map((observation) => {
            if (
              !observation.geojson.coordinates[0] ||
              !observation.geojson.coordinates[1]
            ) {
              return null
            }
            return (
              <Marker
                key={observation.id}
                latitude={observation.geojson.coordinates[1]}
                longitude={observation.geojson.coordinates[0]}
                anchor="bottom"
                // offsetLeft={-20}
                // offsetTop={-10}
              >
                <Link
                  href={
                    observation.uri ?? observation.taxon.wikipedia_url ?? "#"
                  }
                  target="_blank"
                  className="group relative flex aspect-square h-12 items-center justify-center rounded-full bg-yellow-500 p-1 transition-transform hover:scale-[3]"
                  onMouseEnter={() => {
                    console.log(observation.taxon)
                  }}
                  onClick={async (e) => {
                    e.preventDefault()
                    // TODO:
                    if (
                      !observation.geojson.coordinates[0] ||
                      !observation.geojson.coordinates[1]
                    ) {
                      return
                    }
                    const result = await calcNavigation({
                      from: center,
                      to: {
                        lat: observation.geojson.coordinates[1],
                        lng: observation.geojson.coordinates[0],
                      },
                    })
                    console.log(result)
                  }}
                >
                  {/* <Squirrel size={24} className="animate text-white" /> */}
                  {observation.taxon.default_photo && (
                    <Image
                      src={observation.taxon.default_photo.square_url}
                      className="h-full w-full rounded-full"
                      alt={"Observation"}
                      unoptimized
                      width={1}
                      height={1}
                    />
                  )}
                  <div className="absolute -bottom-4 line-clamp-1 hidden whitespace-nowrap rounded-full bg-yellow-500 p-1 text-[4px] font-bold leading-none text-white group-hover:flex">
                    {observation.taxon.preferred_common_name ||
                      observation.taxon.name}
                  </div>
                </Link>
              </Marker>
            )
          })}
        </Map>
      </main>
    </>
  )
}
