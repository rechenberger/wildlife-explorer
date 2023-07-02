import { useAtomValue, useSetAtom, useStore } from "jotai"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Marker } from "react-map-gl"
import { MapBase, mapStateAtom } from "~/client/MapBase"
import { WalkerMarker, playerLocationAtom } from "~/client/WalkerMarker"
import { WalkerRoute, calcNavigationAtom } from "~/client/WalkerRoute"
import { api } from "~/utils/api"

export default function Page() {
  const store = useStore()

  const mapState = useAtomValue(mapStateAtom)

  const { data, isFetching } = api.wildlife.find.useQuery(mapState, {
    keepPreviousData: true,
  })

  // const { mutateAsync: calcNavigation } =
  //   api.navigation.calcNavigation.useMutation()

  const calcNavigation = useSetAtom(calcNavigationAtom)

  return (
    <>
      <main className="relative flex h-[100svh] w-full">
        {isFetching && (
          <div className="absolute right-2 top-2 z-50 animate-spin text-yellow-500">
            <Loader2 />
          </div>
        )}
        <MapBase>
          <WalkerRoute />
          <WalkerMarker />

          {/* <Marker
            latitude={50.928435947011906}
            longitude={6.930087265110956}
            anchor="center"
          >
            <div className="relative aspect-square rounded-full border-2 bg-blue-500 ring-2 ring-blue-400">
              <User2 size={24} className="animate text-white" />
              <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-blue-400" />
            </div>
          </Marker> */}
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
        </MapBase>
      </main>
    </>
  )
}
