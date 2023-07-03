import { differenceInSeconds } from "date-fns"
import { atom, useSetAtom } from "jotai"
import { Radar } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { type LatLng } from "~/server/lib/latLng"
import { api } from "~/utils/api"
import { cn } from "./cn"
import { usePlayer } from "./usePlayer"

export const scanningLocationAtom = atom<LatLng | null>(null)

export const ScanButton = () => {
  const { playerId, player } = usePlayer()
  const setScanningLocation = useSetAtom(scanningLocationAtom)
  const trpc = api.useContext()
  const { mutateAsync: scan, isLoading } = api.wildlife.scan.useMutation({
    onSuccess: () => {
      trpc.wildlife.invalidate()
    },
    onSettled: () => {
      trpc.player.invalidate()
    },
  })

  const [cooldown, setCooldown] = useState(0)
  useEffect(() => {
    const scanCooldownAt = player?.scanCooldownAt
    if (!scanCooldownAt) {
      setCooldown(0)
      return
    }
    const interval = setInterval(() => {
      let cooldown = differenceInSeconds(scanCooldownAt, Date.now())
      cooldown = Math.max(0, cooldown)
      cooldown = Math.ceil(cooldown)
      setCooldown(cooldown)
    }, 1000)
    return () => clearInterval(interval)
  }, [player?.scanCooldownAt])

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          disabled={isLoading}
          className={cn(
            "relative rounded-xl bg-black p-2 text-white",
            isLoading && "animate-pulse",
            !!cooldown && "opacity-100"
          )}
          onClick={async () => {
            if (!playerId || !player) return
            setScanningLocation(player)
            const promise = scan({
              playerId,
            })
            try {
              toast.promise(promise, {
                loading: "Scanning...",
                success: (result) =>
                  `Scan complete! ${result.countFound} new Observations.`,
                error: "Scan failed.",
              })
              await promise
            } finally {
              setScanningLocation(null)
            }
          }}
        >
          <Radar size={32} />
          {!!cooldown && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 font-bold">
              {cooldown}s
            </div>
          )}
        </button>
        <div className="font-bold [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]">
          Scan
        </div>
      </div>
    </>
  )
}
