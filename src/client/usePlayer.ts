import { useSetAtom } from "jotai"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { api } from "~/utils/api"
import { playerLocationAtom } from "./WalkerMarker"

export const usePlayer = () => {
  const session = useSession()
  const router = useRouter()
  const isLoggedIn = !!session.data
  const setPlayerLocation = useSetAtom(playerLocationAtom)
  const { data: player } = api.player.getMe.useQuery(undefined, {
    enabled: isLoggedIn,
    onError: (error) => {
      if (error && error.data?.code === "NOT_FOUND") {
        router.push("/player/create")
      }
    },
    onSuccess: (data) => {
      setPlayerLocation({
        lat: data.lat,
        lng: data.lng,
      })
    },
  })

  return {
    player,
    playerId: player?.id,
  }
}
