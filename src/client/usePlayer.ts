import { useSession } from "next-auth/react"
import { api } from "~/utils/api"

export const usePlayer = () => {
  const session = useSession()
  const isLoggedIn = !!session.data
  const { data: player, error } = api.player.getMe.useQuery(undefined, {
    enabled: isLoggedIn,
  })

  return {
    player,
  }
}
