import { useAtomValue, useSetAtom } from "jotai"
import { Check, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Marker } from "react-map-gl"
import { type RouterOutputs } from "~/utils/api"
import { currentObservationIdAtom } from "./CurrentObservation"
import { FighterChipByWildlife } from "./FighterChipByWildlife"
import { cn } from "./cn"
import { useActiveNavigation } from "./useActiveNavigation"
import { navigatingToObservationIdAtom, useNavigation } from "./useNavigation"

type Wildlife = RouterOutputs["wildlife"]["nearMe"][number]

export const WildlifeMarker = ({ w }: { w: Wildlife }) => {
  const setCurrentObservationId = useSetAtom(currentObservationIdAtom)
  const navigatingtoObservationId = useAtomValue(navigatingToObservationIdAtom)

  const { isNavigating } = useActiveNavigation()
  const { navigate } = useNavigation()

  const [hovering, setHovering] = useState(false)

  const onCooldown = w.respawnsAt > new Date()
  if (!w.lat || !w.lng) {
    return null
  }

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
        className={cn(
          "group relative flex aspect-square h-12 items-center justify-center rounded-full bg-amber-400 p-1 shadow transition-transform md:hover:scale-[3]",
          !!w.metadata.observationCaptive && "bg-orange-700",
          !!w.caughtAt && "bg-green-500 opacity-50",
          onCooldown && "bg-gray-400 opacity-50",
          isNavigating &&
            navigatingtoObservationId === w.observationId &&
            "bg-blue-500"
        )}
        // onMouseEnter={() => {
        //   console.log(w)
        // }}
        onClick={async (e) => {
          e.stopPropagation()
          e.preventDefault()
          setCurrentObservationId(w.observationId)
          // if (!w.lat || !w.lng) return
          // navigate({
          //   lat: w.lat,
          //   lng: w.lng,
          // })
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
        onMouseEnter={() => {
          setHovering(true)
        }}
        onMouseLeave={() => {
          setHovering(false)
        }}
      >
        {/* <Squirrel size={24} className="animate text-white" /> */}
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
          <FighterChipByWildlife
            w={w}
            showAbsoluteHp={false}
            ltr={true}
            enabled={hovering}
          />
        </div>
      </Link>
    </Marker>
  )
}
