import { useSetAtom } from "jotai"
import { Check, Clock, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Marker } from "react-map-gl"
import { WILDLIFE_REFETCH_INTERVAL_IN_MS } from "~/config"
import { api } from "~/utils/api"
import { currentObservationIdAtom } from "./CurrentObservation"
import { cn } from "./cn"
import { usePlayer } from "./usePlayer"

export const useWildlife = () => {
  const { playerId } = usePlayer()
  const { data: wildlife, isFetching } = api.wildlife.nearMe.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      keepPreviousData: true,
      refetchInterval: WILDLIFE_REFETCH_INTERVAL_IN_MS,
    }
  )
  return {
    wildlife,
    isFetching,
  }
}

export const WildlifeMarkers = () => {
  // const mapState = useAtomValue(mapStateAtom)
  // const { data: wildlifes, isFetching } = api.wildlife.find.useQuery(mapState, {
  //   keepPreviousData: true,
  // })

  const { wildlife, isFetching } = useWildlife()
  const setCurrentObservationId = useSetAtom(currentObservationIdAtom)

  // const { navigate } = useNavigation()

  return (
    <>
      {isFetching && (
        <div className="absolute right-2 top-2 z-50 animate-spin text-amber-400">
          <Loader2 />
        </div>
      )}
      {wildlife?.map((w) => {
        const onCooldown =
          w.status?.respawnsAt && w.status.respawnsAt > new Date()
        if (!w.lat || !w.lng) {
          return null
        }
        return (
          <Marker key={w.id} latitude={w.lat} longitude={w.lng} anchor="center">
            <Link
              href={w.observationUrl ?? w.wikiUrl ?? "#"}
              target="_blank"
              className={cn(
                "group relative flex aspect-square h-12 items-center justify-center rounded-full bg-amber-400 p-1 shadow transition-transform hover:scale-[3]",
                !!w.caughtAt && "bg-green-500 opacity-50",
                onCooldown && "bg-gray-400 opacity-50"
              )}
              // onMouseEnter={() => {
              //   console.log(w)
              // }}
              onClick={async (e) => {
                e.stopPropagation()
                e.preventDefault()
                setCurrentObservationId(w.id)
                // if (!w.lat || !w.lng) return
                // navigate({
                //   lat: w.lat,
                //   lng: w.lng,
                // })
              }}
            >
              {/* <Squirrel size={24} className="animate text-white" /> */}
              {w.imgUrl && (
                <Image
                  src={w.imgUrl}
                  className={cn(
                    "h-full w-full rounded-full",
                    !!w.caughtAt && "grayscale"
                  )}
                  alt={"Observation"}
                  unoptimized
                  width={1}
                  height={1}
                />
              )}
              {!!w.caughtAt ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-green-500 opacity-40"></div>
                  <div className="absolute inset-0 flex items-center justify-center ">
                    <Check size={32} className="text-white" />
                  </div>
                </>
              ) : onCooldown ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-500 opacity-40"></div>
                  <div className="absolute inset-0 flex items-center justify-center ">
                    <Clock size={32} className="text-white" />
                  </div>
                </>
              ) : null}
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
