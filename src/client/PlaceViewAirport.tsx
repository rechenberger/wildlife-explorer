import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import { useState } from "react"
import { toast } from "sonner"
import { DEFAULT_MAP_PITCH, DEFAULT_MAP_ZOOM } from "~/config"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { PlaceViewModal } from "./PlaceViewModal"
import { Input } from "./shadcn/ui/input"
import { useMapFlyTo } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const PlaceViewAirport = ({ placeId }: { placeId: string }) => {
  const { playerId } = usePlayer()
  const [query, setQuery] = useState("")
  const { data } = api.place.searchAirports.useQuery(
    {
      query,
      playerId: playerId!,
    },
    {
      enabled: !!playerId && query.length >= 3,
    }
  )

  const trpc = api.useContext()
  const { mutateAsync: fly } = api.place.flyToAirport.useMutation({
    onSuccess: () => {
      trpc.invalidate()
    },
  })

  const mapFlyTo = useMapFlyTo()

  return (
    <>
      <div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-96"
        />
      </div>
      <div className="flex flex-col gap-1 w-96">
        {map(data, (airport) => (
          <button
            key={airport.code}
            className="flex flex-row gap-2 rounded p-2 bg-gray-100 hover:bg-gray-200 text-xs items-center text-left"
            onClick={async () => {
              if (!confirm(`Fly to ${airport.name}?`)) return
              if (!playerId) return
              const promise = fly({
                playerId,
                destinationCode: airport.code,
                placeId,
              })
              toast.promise(promise, {
                loading: "Flying...",
                success: "You have arrived!",
                error: (err: any) => err?.message || "Something went wrong",
              })
              try {
                await promise
                NiceModal.hide(PlaceViewModal)
                mapFlyTo({
                  center: airport,
                  pitch: DEFAULT_MAP_PITCH,
                  zoom: DEFAULT_MAP_ZOOM,
                })
              } catch (e) {
                return
              }
            }}
          >
            <div className="flex flex-col overflow-hidden">
              <div className="truncate">{airport.name}</div>
              <div className="truncate">
                {airport.city}, {airport.country}
              </div>
            </div>
            <div className="flex-1" />
            <Away location={airport} />
          </button>
        ))}
      </div>
    </>
  )
}
