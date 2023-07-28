import NiceModal from "@ebay/nice-modal-react"
import { PlaceType } from "@prisma/client"
import { HeartPulse, Plane } from "lucide-react"
import { Marker } from "react-map-gl"
import { type RouterOutputs } from "~/utils/api"
import { PlaceViewModal } from "./PlaceViewModal"
import { cn } from "./cn"
import { useMarkerScalingProps } from "./useMarkerScaling"
import { useNavigation } from "./useNavigation"

type Place = RouterOutputs["place"]["nearMe"][number]

export const placeTypeIcons = {
  [PlaceType.CARE_CENTER]: {
    icon: HeartPulse,
    bgColor: "bg-purple-500",
    label: "Wildlife Care Center",
  },
  [PlaceType.AIRPORT]: {
    icon: Plane,
    bgColor: "bg-cyan-500",
    label: "Airport",
  },
}

export const PlaceMarker = ({ place }: { place: Place }) => {
  const { navigate } = useNavigation()

  const { markerScalingProps } = useMarkerScalingProps()

  const placeTypeIcon = placeTypeIcons[place.type]

  if (!placeTypeIcon) return null

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
        {...markerScalingProps}
        className={cn(
          "group relative flex aspect-square h-12 items-center justify-center rounded-full p-1 shadow transition-transform md:hover:scale-[3]",
          "cursor-pointer",
          "bg-black",
          placeTypeIcon?.bgColor
        )}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          NiceModal.show(PlaceViewModal, {
            placeId: place.id,
          })
        }}
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
          <placeTypeIcon.icon className="text-white w-8 h-8" />
        </div>
        <div
          className={cn(
            "absolute -bottom-4 line-clamp-1 hidden whitespace-nowrap rounded-full p-1 text-[4px] font-bold leading-none text-white shadow md:group-hover:flex",
            "bg-black",
            placeTypeIcon?.bgColor
          )}
        >
          {place.metadata.name || placeTypeIcon?.label || "Unknown Place"}
        </div>
      </div>
    </Marker>
  )
}
