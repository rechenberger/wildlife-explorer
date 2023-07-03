import { Loader2 } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { DEFAULT_LOCATION } from "~/config"
import { type LatLng } from "~/server/lib/latLng"
import { api } from "~/utils/api"
import { cn } from "./cn"

export const PlayerCreationForm = () => {
  const router = useRouter()
  const { mutate, isLoading: mutationIsLoading } =
    api.player.createMe.useMutation({
      onSuccess: (player) => {
        router.push(`/play/${player.id}#${player.lat},${player.lng}`)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })

  const [startAtMyLocation, setStartAtMyLocation] = useState(false)
  const [myLocation, setMyLocation] = useState<LatLng | null>(null)
  const myLocationLoading = startAtMyLocation && !myLocation
  const disabled = myLocationLoading || mutationIsLoading

  useEffect(() => {
    if (startAtMyLocation) {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by this browser.")
        setStartAtMyLocation(false)
        setMyLocation(null)
        return
      }
      const promise = new Promise<void>((resolve, reject) => {
        // setTimeout(() => {
        //   reject(new Error("Timed out"))
        // }, 10000)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setMyLocation({ lat: latitude, lng: longitude })
            resolve()
          },
          (error) => {
            setStartAtMyLocation(false)
            setMyLocation(null)
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject({ message: "User denied the request for Geolocation." })
                break
              case error.POSITION_UNAVAILABLE:
                reject({ message: "Location information is unavailable." })
                break
              case error.TIMEOUT:
                reject({
                  message: "The request to get user location timed out.",
                })
                break
              default:
                reject(error)
            }
            reject(error)
          },
          {
            maximumAge: 10 * 60 * 1000, // Accept a cached position that is up to 10 minutes old
            timeout: 10_000,
          }
        )
      })
      toast.promise(promise, {
        loading: "Getting your location...",
        success: "Got your location!",
        error: (error) => error.message,
      })
    } else {
      setMyLocation(null)
    }
  }, [startAtMyLocation])

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white/20 p-4"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData.entries())
        const schema = z.object({
          name: z.string().min(1),
        })
        const parsed = schema.parse(data)

        mutate({
          ...parsed,
          lat: DEFAULT_LOCATION.lat,
          lng: DEFAULT_LOCATION.lng,
          ...myLocation,
        })
      }}
    >
      {/* <div className="text-2xl">Create Player</div> */}
      <label className="flex flex-col">
        <div>Name</div>
        <input
          type="text"
          name="name"
          className="rounded border bg-transparent px-2 py-1"
          required
        />
      </label>
      <label className="flex flex-row items-center gap-2">
        <input
          type="checkbox"
          name="startAtMyLocation"
          checked={startAtMyLocation}
          onChange={(e) => setStartAtMyLocation(e.target.checked)}
          disabled={disabled}
        />
        <div>Start at My Location</div>
        {myLocationLoading && <Loader2 size={16} className="animate-spin" />}
      </label>
      <button
        disabled={disabled}
        className={cn(
          "tex-sm rounded bg-black px-2 py-1 text-white",
          disabled && "opacity-50"
        )}
      >
        Create Character
      </button>
    </form>
  )
}
