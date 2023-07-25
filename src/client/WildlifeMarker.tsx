import NiceModal from "@ebay/nice-modal-react"
import { useAtomValue } from "jotai"
import { Check, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Marker } from "react-map-gl"
import { IV_SCORE_EXCEPTIONAL } from "~/config"
import { type RouterOutputs } from "~/utils/api"
import { CurrentObservationModal } from "./CurrentObservationModal"
import { FighterChip } from "./FighterChip"
import { cn } from "./cn"
import { getFighterImage } from "./getFighterImage"
import { useMarkerScaling } from "./useMarkerScaling"
import { navigatingToObservationIdAtom, useNavigation } from "./useNavigation"
import { useShowFighters } from "./useShowFighter"

type NearMe = RouterOutputs["wildlife"]["nearMe"][number]

export const WildlifeMarker = ({
  nearMe,
  isNavigating,
}: {
  nearMe: NearMe
  isNavigating: boolean
}) => {
  const w = nearMe.wildlife
  const navigatingtoObservationId = useAtomValue(navigatingToObservationIdAtom)

  const { markerScalingProps } = useMarkerScaling()

  const { navigate } = useNavigation()

  // const [hovering, setHovering] = useState(false)

  const showFighters = useShowFighters()

  const onCooldown = w.respawnsAt > new Date()
  if (!w.lat || !w.lng) {
    return null
  }

  const ivScore = nearMe.fighter.ivScore

  return (
    <Marker
      key={w.observationId}
      latitude={w.lat}
      longitude={w.lng}
      anchor="center"
      style={{
        zIndex: 10,
      }}
    >
      <Link
        href={w.metadata.observationUrl ?? w.metadata.taxonWikiUrl ?? "#"}
        target="_blank"
        {...markerScalingProps}
        className={cn(
          "group relative flex aspect-square h-12 items-center justify-center rounded-full bg-amber-400 p-1 shadow transition-transform md:hover:scale-[3]",
          !!w.metadata.observationCaptive && "bg-orange-700",
          !!w.caughtAt && "bg-green-500 opacity-50",
          onCooldown && "bg-gray-400 opacity-50",
          isNavigating &&
            navigatingtoObservationId === w.observationId &&
            "bg-blue-500",
          showFighters && ["bg-transparent shadow-none"]
        )}
        onClick={async (e) => {
          e.stopPropagation()
          e.preventDefault()
          NiceModal.show(CurrentObservationModal, {
            wildlifeId: w.id,
          })
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          navigate({
            lat: w.lat,
            lng: w.lng,
            observationId: w.observationId,
          })
        }}
        // onMouseEnter={() => {
        //   setHovering(true)
        // }}
        // onMouseLeave={() => {
        //   setHovering(false)
        // }}
      >
        {/* <Squirrel size={24} className="animate text-white" /> */}
        {showFighters ? (
          <>
            <Image
              src={getFighterImage({
                fighterSpeciesNum: nearMe.fighter.speciesNum,
              })}
              className={cn(
                "h-full w-full rounded-full scale-[3]",
                !!w.caughtAt && "grayscale",
                !!ivScore &&
                  ivScore >= IV_SCORE_EXCEPTIONAL &&
                  "bg bg-gradient-radial from-amber-200/80 via-transparent to-transparent"
              )}
              alt={"Observation"}
              unoptimized
              width={1}
              height={1}
            />
          </>
        ) : (
          <>
            {w.metadata.taxonImageUrlSquare && (
              <Image
                src={w.metadata.taxonImageUrlSquare}
                className={cn(
                  "h-full w-full rounded-full",
                  !!w.caughtAt && "grayscale"
                )}
                alt={"Observation"}
                unoptimized
                width={1}
                height={1}
              />
            )}
          </>
        )}

        {!!w.caughtAt ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-green-500 opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center ">
              <Check size={32} className="text-white" />
            </div>
          </>
        ) : onCooldown ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-500 opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center ">
              <Clock size={32} className="text-white" />
            </div>
          </>
        ) : null}
        {/* <div className="absolute -bottom-4 line-clamp-1 hidden whitespace-nowrap rounded-full bg-amber-400 p-1 text-[4px] font-bold leading-none text-white shadow md:group-hover:flex">
                {getName(w)}
              </div> */}
        <div className="absolute -bottom-10 line-clamp-1 hidden overflow-visible p-1 text-[4px] font-bold leading-none md:group-hover:flex scale-[40%] text-black w-56 flex-col">
          <FighterChip fighter={nearMe} showAbsoluteHp={false} ltr={true} />
        </div>
      </Link>
    </Marker>
  )
}
