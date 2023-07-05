import { Footprints } from "lucide-react"
import { TimeAgo } from "./TimeAgo"
import { useActiveNavigation } from "./useActiveNavigation"

export const Eta = () => {
  const { etaIso } = useActiveNavigation()
  if (!etaIso) return null
  return (
    <>
      <div className="fixed left-4 top-4 flex flex-row items-center gap-2 rounded-full bg-blue-500 px-2 py-1 text-sm font-bold text-white">
        <Footprints size={16} />
        <TimeAgo date={etaIso} addSuffix={false} />
      </div>
    </>
  )
}
