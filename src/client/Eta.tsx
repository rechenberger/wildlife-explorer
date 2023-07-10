import { Bike, Car, Footprints } from "lucide-react"
import { TimeAgo } from "./TimeAgo"
import { useActiveNavigation } from "./useActiveNavigation"
import { usePlayer } from "./usePlayer"

export const Eta = () => {
  const { etaIso } = useActiveNavigation()
  const { player } = usePlayer()
  if (!etaIso) return null
  const travelingBy = player?.metadata?.navigation?.travelingBy
  const Icon =
    travelingBy === "driving"
      ? Car
      : travelingBy === "cycling"
      ? Bike
      : Footprints
  return (
    <>
      <div className="fixed z-40 left-4 top-4 flex flex-row items-center gap-2 rounded-full bg-blue-500 px-2 py-1 text-sm font-bold text-white max-md:left-[50%] max-md:translate-x-[-50%] max-md:top-20">
        <Icon size={16} />
        <TimeAgo date={etaIso} addSuffix={false} />
      </div>
    </>
  )
}
