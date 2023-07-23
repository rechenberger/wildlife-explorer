import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import { ArrowLeftRight } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { CareButton } from "./CareButton"
import { MyCatchesModal } from "./MyCatchesModal"
import { placeTypeIcons } from "./PlaceMarker"
import { PlaceViewModal } from "./PlaceViewModal"
import { TypeBadge } from "./TypeBadge"
import { Button } from "./shadcn/ui/button"
import { Input } from "./shadcn/ui/input"
import { navigateIcon, runIcon } from "./typeIcons"
import { useMapFlyTo } from "./useMapRef"
import { useNavigation } from "./useNavigation"
import { usePlayer } from "./usePlayer"

const SHOW_FLUFF = true

export const PlaceView = ({
  placeId,
  close,
}: {
  placeId: string
  close: () => void
}) => {
  const { playerId } = usePlayer()
  const { data: place } = api.place.getOne.useQuery(
    { playerId: playerId!, placeId },
    { enabled: !!playerId }
  )

  const { navigate } = useNavigation()

  if (!place) {
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )
  }
  const typeIcon = placeTypeIcons[place.type]

  return (
    <div className="flex flex-col items-center gap-4 pt-12">
      <typeIcon.icon className="w-8 h-8 self-center" />
      <div className="flex flex-col text-center">
        {SHOW_FLUFF && (
          <div className="text-sm text-gray-500 italic text-center">
            Welcome to
          </div>
        )}
        <div>{typeIcon.label}</div>
        {place.metadata.name && (
          <div className="text-sm opacity-60">{place.metadata.name}</div>
        )}
        <Away location={place} />
      </div>
      {place.type === "CARE_CENTER" && <PlaceViewWildlifeCareCenter />}
      {place.type === "AIRPORT" && <PlaceViewAirport placeId={placeId} />}
      <div className="mt-8 flex flex-row gap-4 w-56">
        <TypeBadge
          icon={navigateIcon}
          content={"Visit"}
          size="big"
          onClick={() => {
            navigate({
              lat: place.lat,
              lng: place.lng,
            })
          }}
          className="flex-1"
        />
        <TypeBadge
          icon={runIcon}
          content={"Leave"}
          size="big"
          onClick={() => {
            close()
          }}
          className="flex-1"
        />
      </div>
    </div>
  )
}

const PlaceViewWildlifeCareCenter = () => {
  return (
    <>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          This is the perfect place to rest, rejuvenate your team, and prepare
          for your next battle.
        </div>
      )}
      <div className="flex flex-col w-56">
        <CareButton />
      </div>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          Don&apos;t forget to manage your team and strategize by swapping
          moves.
        </div>
      )}
      <div className="flex flex-col w-56">
        <Button
          onClick={() => {
            NiceModal.show(MyCatchesModal)
          }}
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          <span>Manage my Team</span>
        </Button>
      </div>
      {SHOW_FLUFF && (
        <div className="text-sm text-gray-500 italic text-center">
          Remember, every battle is a step closer to becoming the ultimate
          Wildlife Explorer. Let&apos;s get ready for the next adventure!
        </div>
      )}
    </>
  )
}
const PlaceViewAirport = ({ placeId }: { placeId: string }) => {
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
