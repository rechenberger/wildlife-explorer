import { Radar } from "lucide-react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { cn } from "./cn"
import { usePlayer } from "./usePlayer"

export const ScanButton = () => {
  const { playerId } = usePlayer()
  const { mutateAsync: scan, isLoading } = api.wildlife.scan.useMutation()
  return (
    <>
      <button
        disabled={isLoading}
        className={cn(
          "absolute bottom-8 left-8 rounded-xl bg-black p-2 text-white",
          isLoading && "animate-pulse"
        )}
        onClick={() => {
          if (!playerId) return
          toast.promise(
            scan({
              playerId,
            }),
            {
              loading: "Scanning...",
              success: (result) =>
                `Scan complete! ${result.countFound} new Observations.`,
              error: "Scan failed.",
            }
          )
        }}
      >
        <Radar size={32} />
      </button>
    </>
  )
}
