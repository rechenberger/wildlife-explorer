import { HeartPulse } from "lucide-react"
import { Marker } from "react-map-gl"
import { type RouterOutputs } from "~/utils/api"
import { cn } from "./cn"
import { useNavigation } from "./useNavigation"

type Place = RouterOutputs["place"]["nearMe"][number]

export const PlaceMarker = ({ place }: { place: Place }) => {
  const { navigate } = useNavigation()

  return (
    <Marker
      key={place.id}
      latitude={place.lat}
      longitude={place.lng}
      anchor="center"
      style={{
        zIndex: 10,
      }}
    >
      <div
        className={cn(
          "group relative flex aspect-square h-12 items-center justify-center rounded-full bg-purple-500 p-1 shadow transition-transform md:hover:scale-[3]"
        )}
        onDoubleClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          navigate({
            lat: place.lat,
            lng: place.lng,
          })
        }}
      >
        <div className="">
          <HeartPulse className="text-white w-8 h-8" />
        </div>
        <div className="absolute -bottom-4 line-clamp-1 hidden whitespace-nowrap rounded-full bg-purple-500 p-1 text-[4px] font-bold leading-none text-white shadow md:group-hover:flex">
          {place.metadata.name || "Wildlife Care Center"}
        </div>
      </div>
    </Marker>
  )
}
