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
          "group relative flex aspect-square h-12 items-center justify-center rounded-full bg-amber-400 p-1 shadow transition-transform md:hover:scale-[3]",
          "bg-purple-500"
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
        {place.metadata.name && (
          <div className="absolute -bottom-10 line-clamp-1 hidden overflow-visible p-1 text-[4px] font-bold leading-none shadow md:group-hover:flex scale-[40%] text-black w-56 flex-col">
            {place.metadata.name}
          </div>
        )}
      </div>
    </Marker>
  )
}
