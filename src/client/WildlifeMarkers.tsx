import { useAtomValue, useSetAtom, useStore } from "jotai"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Marker } from "react-map-gl"
import { api } from "~/utils/api"
import { mapStateAtom } from "./MapBase"
import { playerLocationAtom } from "./WalkerMarker"
import { calcNavigationAtom } from "./WalkerRoute"

export const WildlifeMarkers = () => {
  const mapState = useAtomValue(mapStateAtom)
  const { data, isFetching } = api.wildlife.find.useQuery(mapState, {
    keepPreviousData: true,
  })

  const store = useStore()
  const calcNavigation = useSetAtom(calcNavigationAtom)

  return (
    <>
      {isFetching && (
        <div className="absolute right-2 top-2 z-50 animate-spin text-yellow-500">
          <Loader2 />
        </div>
      )}
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
            anchor="center"
          >
            <Link
              href={observation.uri ?? observation.taxon.wikipedia_url ?? "#"}
              target="_blank"
              className="group relative flex aspect-square h-12 items-center justify-center rounded-full bg-yellow-500 p-1 transition-transform hover:scale-[3]"
              onMouseEnter={() => {
                console.log(observation.taxon)
              }}
              onClick={async (e) => {
                e.preventDefault()
                if (
                  !observation.geojson.coordinates[0] ||
                  !observation.geojson.coordinates[1]
                ) {
                  return
                }
                await calcNavigation([
                  {
                    from: store.get(playerLocationAtom),
                    to: {
                      lat: observation.geojson.coordinates[1],
                      lng: observation.geojson.coordinates[0],
                    },
                  },
                ])
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
    </>
  )
}
