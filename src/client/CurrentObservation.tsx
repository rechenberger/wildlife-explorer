import { atom, useAtomValue, useSetAtom } from "jotai"
import { X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { useWildlife } from "./WildlifeMarkers"
import { cn } from "./cn"
import { useNavigation } from "./useNavigation"
import { usePlayer } from "./usePlayer"

export const currentObservationIdAtom = atom<number | null>(null)

export const CurrentObservation = () => {
  const { wildlife } = useWildlife()
  const currentObservationId = useAtomValue(currentObservationIdAtom)
  const setCurrentObservationId = useSetAtom(currentObservationIdAtom)

  const w = wildlife?.find((w) => w.id === currentObservationId)

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
        <div className="-mt-2">
          {location && <Away location={location} />}
          <div className="flex-1" />
          {w.status && (
            <div className="text-sm font-bold text-gray-500">
              Respawn{" "}
              {w.status.respawnsAt.toLocaleTimeString(undefined, {
                hour12: false,
                // minute: "2-digit",
                timeStyle: "short",
              })}
            </div>
          )}
          {!!w.caughtAt && (
            <div className="text-sm font-bold text-green-500">
              Caught{" "}
              {w.caughtAt?.toLocaleTimeString(undefined, {
                hour12: false,
                // minute: "2-digit",
                timeStyle: "short",
              })}
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
              className="rounded bg-black px-2 py-1 text-white"
              onClick={() => {
                navigate(location)
              }}
            >
              Navigate here
            </button>
          )}
          <button
            className={cn(
              "rounded bg-black px-2 py-1 text-white",
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
