import { atom, useAtomValue } from "jotai"
import Image from "next/image"
import { Away } from "./Away"
import { useWildlife } from "./WildlifeMarkers"
import { useNavigation } from "./useNavigation"

export const currentObservationIdAtom = atom<number | null>(null)

export const CurrentObservation = () => {
  const { wildlife } = useWildlife()
  const currentObservationId = useAtomValue(currentObservationIdAtom)

  const w = wildlife?.find((w) => w.id === currentObservationId)

  const { navigate } = useNavigation()

  if (!w) return null

  const location = w.lat && w.lng ? { lat: w.lat, lng: w.lng } : null

  return (
    <>
      <div className="fixed bottom-8 right-8 flex w-full max-w-md flex-col gap-4 rounded-xl bg-white/80 p-4 text-black shadow">
        <div className="text-2xl">{w.name}</div>
        <div className="-mt-2">{location && <Away location={location} />}</div>
        {w.imgUrlMedium && (
          <div className="-mx-4">
            <Image
              src={w.imgUrlMedium}
              className="w-full"
              alt={"Observation"}
              unoptimized
              width={1}
              height={1}
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
          {/* <button
            className="rounded bg-black px-2 py-1 text-white"
            onClick={() => {}}
          >
            Catch
          </button> */}
        </div>
      </div>
    </>
  )
}
