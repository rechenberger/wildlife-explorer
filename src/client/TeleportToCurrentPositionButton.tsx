import { atom, useSetAtom } from "jotai"
import { LocateFixed } from "lucide-react"
import { useState } from "react"
import { type LatLng } from "~/server/lib/latLng"
import { api } from "~/utils/api"
import { playerLocationAtom } from "./WalkerMarker"
import { cn } from "./cn"
import { usePlayer } from "./usePlayer"
import { useGetMyLocation } from "./ useGetMyLocation"

export const scanningLocationAtom = atom<LatLng | null>(null)

export const TeleportToCurrentPositionButton = () => {
  const { playerId, player } = usePlayer()
  const setPlayerLocation = useSetAtom(playerLocationAtom)
  const trpc = api.useContext()
  const { mutateAsync: move } = api.player.move.useMutation({
    onSuccess: () => {
      trpc.wildlife.invalidate()
    },
    onSettled: () => {
      trpc.player.invalidate()
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const getMyLocation = useGetMyLocation()
  // const router = useRouter()

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          disabled={isLoading}
          className={cn(
            "relative rounded-xl bg-black p-2 text-white",
            isLoading && "animate-pulse"
          )}
          onClick={async () => {
            if (!playerId || !player) return
            setIsLoading(true)
            try {
              const location = await getMyLocation({
                maximumAge: 10 * 1000,
                timeout: 10 * 1000,
              })
              if (!location) return
              setPlayerLocation(location)
              await move({
                ...location,
                playerId,
              })
              setPlayerLocation(location)
              // await router.replace(
              //   `/player/${playerId}#${location.lat},${location.lng}`,
              //   undefined,
              //   {
              //     shallow: false,
              //   }
              // )
              window.location.href = `/player/${playerId}#${location.lat},${location.lng}`
              window.location.reload()
            } finally {
              setIsLoading(false)
            }
          }}
        >
          <LocateFixed size={32} />
        </button>
        <div className="font-bold [text-shadow:_0px_0px_2px_rgb(0_0_0_/_80%)]">
          To Me
        </div>
      </div>
    </>
  )
}
