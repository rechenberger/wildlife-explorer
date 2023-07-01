import { User2 } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { Map, Marker } from "react-map-gl"
import { env } from "~/env.mjs"
import { api } from "~/utils/api"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })

export default function Page() {
  const { data } = api.wildlife.find.useQuery({
    lat: 50.928435947011906,
    lng: 6.930087265110956,
  })
  return (
    <>
      <main className="flex h-[100svh] w-full">
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
          onMove={(e) => console.log(e)}
        >
          <Marker
            latitude={50.928435947011906}
            longitude={6.930087265110956}
            anchor="bottom"
            // offsetLeft={-20}
            // offsetTop={-10}
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
                  href={observation.taxon.wikipedia_url ?? "#"}
                  target="_blank"
                  className="group relative flex aspect-square h-12 items-center justify-center rounded-full bg-yellow-500 p-1 transition-transform hover:scale-[3]"
                  onMouseEnter={() => {
                    console.log(observation.taxon)
                  }}
                >
                  {/* <Squirrel size={24} className="animate text-white" /> */}
                  <Image
                    src={observation.taxon.default_photo.square_url}
                    className="h-full w-full rounded-full"
                    alt={"Observation"}
                    unoptimized
                    width={1}
                    height={1}
                  />
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
