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
  const { data: wildlifes, isFetching } = api.wildlife.find.useQuery(mapState, {
    keepPreviousData: true,
  })

  const store = useStore()
  const calcNavigation = useSetAtom(calcNavigationAtom)

  return (
    <>
      {isFetching && (
        <div className="absolute right-2 top-2 z-50 animate-spin text-amber-400">
          <Loader2 />
        </div>
      )}
      {wildlifes?.map((w) => {
        if (!w.lat || !w.lng) {
          return null
        }
        return (
          <Marker key={w.id} latitude={w.lat} longitude={w.lng} anchor="center">
            <Link
              href={w.observationUrl ?? w.wikiUrl ?? "#"}
              target="_blank"
              className="group relative flex aspect-square h-12 items-center justify-center rounded-full bg-amber-400 p-1 shadow transition-transform hover:scale-[3]"
              // onMouseEnter={() => {
              //   console.log(w)
              // }}
              onClick={async (e) => {
                e.preventDefault()
                if (!w.lat || !w.lng) return
                await calcNavigation([
                  {
                    from: store.get(playerLocationAtom),
                    to: {
                      lat: w.lat,
                      lng: w.lng,
                    },
                  },
                ])
              }}
            >
              {/* <Squirrel size={24} className="animate text-white" /> */}
              {w.imgUrl && (
                <Image
                  src={w.imgUrl}
                  className="h-full w-full rounded-full"
                  alt={"Observation"}
                  unoptimized
                  width={1}
                  height={1}
                />
              )}
              <div className="absolute -bottom-4 line-clamp-1 hidden whitespace-nowrap rounded-full bg-amber-400 p-1 text-[4px] font-bold leading-none text-white shadow group-hover:flex">
                {w.name}
              </div>
            </Link>
          </Marker>
        )
      })}
    </>
  )
}
