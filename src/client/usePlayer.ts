import { useSetAtom } from "jotai"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { api } from "~/utils/api"
import { playerLocationAtom } from "./WalkerMarker"

export const usePlayer = () => {
  const session = useSession()
  const router = useRouter()
  const playerIdFromRouter = router.query.playerId
  const isLoggedIn = !!session.data
  const setPlayerLocation = useSetAtom(playerLocationAtom)
  const { data: player } = api.player.getMe.useQuery(
    {
      playerId:
        typeof playerIdFromRouter === "string" ? playerIdFromRouter : undefined,
    },
    {
      enabled: isLoggedIn,
      // onError: (error) => {
      //   if (error && error.data?.code === "NOT_FOUND") {
      //     router.push("/player/create")
      //   }
      // },
      onSuccess: (data) => {
        setPlayerLocation({
          lat: data.lat,
          lng: data.lng,
        })
      },
    }
  )

  return {
    player,
    playerId: player?.id,
  }
}
