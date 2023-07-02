import { atom, useAtomValue, useSetAtom } from "jotai"
import { Check, Clock, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { TimeAgo } from "./TimeAgo"
import { useWildlife } from "./WildlifeMarkers"
import { cn } from "./cn"
import { navigatingToObservationIdAtom, useNavigation } from "./useNavigation"
import { usePlayer } from "./usePlayer"

export const currentObservationIdAtom = atom<number | null>(null)

export const CurrentObservation = () => {
  const { wildlife } = useWildlife()
  const currentObservationId = useAtomValue(currentObservationIdAtom)
  const setCurrentObservationId = useSetAtom(currentObservationIdAtom)

  const w = wildlife?.find((w) => w.id === currentObservationId)

  const navigatingToObservationId = useAtomValue(navigatingToObservationIdAtom)
  const { navigate } = useNavigation()

  const { playerId } = usePlayer()
  const trpc = api.useContext()
  const { mutateAsync: doCatch, isLoading: catching } =
    api.catch.catch.useMutation({
      onSettled: () => {
        trpc.catch.invalidate()
      },
    })

  if (!w) return null

  const location = w.lat && w.lng ? { lat: w.lat, lng: w.lng } : null
  const onCooldown = w.status?.respawnsAt && w.status.respawnsAt > new Date()

  return (
    <>
      <div className="fixed bottom-0 right-0 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-white p-4 text-black shadow md:bottom-8 md:right-8 md:rounded-xl">
        <div className="flex flex-row items-center gap-2">
          <div className="flex-1 truncate text-2xl">{w.name}</div>
          <button
            className="shrink-0"
            onClick={() => setCurrentObservationId(null)}
          >
            <X size={16} />
          </button>
        </div>
        <div className="-mt-2 flex flex-row flex-wrap justify-between gap-2">
          {location && <Away location={location} />}
          {w.status && onCooldown && (
            <div className="flex flex-row items-center gap-1 text-sm font-bold text-gray-500">
              <Clock size={16} className="inline-block" />
              <span>Respawn</span>
              <TimeAgo date={w.status.respawnsAt} addSuffix />
            </div>
          )}
          {!!w.caughtAt && (
            <div className="flex flex-row items-center gap-1 text-sm font-bold text-green-600">
              <Check size={16} className="inline-block" />
              <span>Caught</span>
              <TimeAgo date={w.caughtAt} addSuffix />
            </div>
          )}
        </div>
        {w.imgUrlMedium && (
          <div className="relative -mx-4 aspect-square">
            <Image
              src={w.imgUrlMedium}
              className="w-full object-cover object-center"
              alt={"Observation"}
              unoptimized
              fill={true}
            />
          </div>
        )}
        <div className="flex flex-row gap-2">
          {location && (
            <button
              className={cn(
                "rounded bg-black px-2 py-1 text-sm text-white",
                navigatingToObservationId === w.id &&
                  "cursor-progress bg-blue-500 opacity-50"
              )}
              onClick={() => {
                navigate({ ...location, observationId: w.id })
              }}
            >
              Navigate here
            </button>
          )}
          <button
            className={cn(
              "rounded bg-black px-2 py-1 text-sm text-white",
              catching && "cursor-progress opacity-50"
            )}
            disabled={catching}
            onClick={async () => {
              if (!playerId) return
              toast.promise(doCatch({ observationId: w.id, playerId }), {
                loading: "Catching...",
                success: (result) =>
                  result.success
                    ? "You caught it!"
                    : result.reason || "Failed to catch",
                error: "Failed to catch",
              })
            }}
          >
            Catch
          </button>
        </div>
      </div>
    </>
  )
}
