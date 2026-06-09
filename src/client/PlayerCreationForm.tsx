import { Loader2 } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { DEFAULT_LOCATION } from "~/config"
import { type LatLng } from "~/server/schema/LatLng"
import { api } from "~/utils/api"
import { cn } from "./cn"
import { useGetMyLocation } from "./ useGetMyLocation"

export const PlayerCreationForm = () => {
  const router = useRouter()
  const { mutate, isLoading: mutationIsLoading } =
    api.player.createMe.useMutation({
      onSuccess: (player) => {
        router.push(`/play/${player.id}`)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })

  const getMyLocation = useGetMyLocation()

  const [startAtMyLocation, setStartAtMyLocation] = useState(false)
  const [myLocation, setMyLocation] = useState<LatLng | null>(null)
  const myLocationLoading = startAtMyLocation && !myLocation
  const disabled = myLocationLoading || mutationIsLoading
  const [hardcore, setHardcore] = useState(false)

  useEffect(() => {
    if (startAtMyLocation) {
      getMyLocation({
        maximumAge: 10 * 60 * 1000,
        timeout: 1000 * 10,
      })
        .then((myLocation) => {
          setMyLocation(myLocation)
        })
        .catch(() => {
          setMyLocation(null)
          setStartAtMyLocation(false)
        })
    } else {
      setMyLocation(null)
    }
  }, [getMyLocation, startAtMyLocation])

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
          hardcore,
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
      <label className="flex flex-row items-center gap-2">
        <input
          type="checkbox"
          name="hardcore"
          checked={hardcore}
          onChange={(e) => setHardcore(e.target.checked)}
          disabled={disabled}
        />
        <div className="flex flex-row gap-1 items-center">
          <div>Hardcore</div>
          <div className="text-xs text-gray-400">(not recommended)</div>
        </div>
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
