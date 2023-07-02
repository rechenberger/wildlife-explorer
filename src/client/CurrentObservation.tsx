import { atom, useAtomValue, useSetAtom } from "jotai"
import { X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { useWildlife } from "./WildlifeMarkers"
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
  const { mutateAsync: doCatch } = api.catch.catch.useMutation()

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
        <div className="-mt-2">{location && <Away location={location} />}</div>
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
            className="rounded bg-black px-2 py-1 text-white"
            onClick={async () => {
              if (!playerId) return
              const result = await doCatch({ observationId: w.id, playerId })
              if (result.success) {
                toast.success("You caught it!")
              } else {
                toast.error(result.reason || "Failed to catch")
              }
            }}
          >
            Catch
          </button>
        </div>
      </div>
    </>
  )
}
