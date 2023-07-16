import { differenceInSeconds } from "date-fns"
import { atom, useSetAtom, useStore } from "jotai"
import { Radar } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { type LatLng } from "~/server/schema/LatLng"
import { api } from "~/utils/api"
import { playerLocationAtom } from "./PlayerMarker"
import { cn } from "./cn"
import { useMapFlyTo } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const scanningLocationAtom = atom<LatLng | null>(null)

export const ScanButton = () => {
  const { playerId, player } = usePlayer()
  const setScanningLocation = useSetAtom(scanningLocationAtom)
  const trpc = api.useContext()
  const store = useStore()
  const { mutateAsync: scan, isLoading } = api.scan.scan.useMutation({
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

  const mapFlyTo = useMapFlyTo()

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
            setScanningLocation(store.get(playerLocationAtom))
            mapFlyTo({ center: store.get(playerLocationAtom) })
            const promise = scan({
              playerId,
            })
            try {
              toast.promise(promise, {
                loading: "Scanning...",
                success: (result) => (
                  <div className="flex flex-col">
                    <div className="font-bold">{`Scan complete!`}</div>
                    <div className="font-normal text-sm">{`${result.wildlife.countFound} new Observations`}</div>
                    <div className="font-normal text-sm">{`${result.places.countFound} new Places`}</div>
                  </div>
                ),
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
