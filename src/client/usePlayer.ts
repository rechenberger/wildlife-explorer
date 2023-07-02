import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { api } from "~/utils/api"

export const usePlayer = () => {
  const session = useSession()
  const router = useRouter()
  const isLoggedIn = !!session.data
  const { data: player } = api.player.getMe.useQuery(undefined, {
    enabled: isLoggedIn,
    onError: (error) => {
      if (error && error.data?.code === "NOT_FOUND") {
        router.push("/player/create")
      }
    },
  })

  return {
    player,
  }
}
