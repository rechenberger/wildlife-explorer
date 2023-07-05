import { useEffect, useState } from "react"
import { usePlayer } from "./usePlayer"

export const useIsNavigating = () => {
  const { player } = usePlayer()

  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (!player) return

    const timer = setInterval(() => {
      const navigation = player.metadata?.navigation
      if (!navigation) {
        setIsNavigating(false)
        return
      }
      if (navigation.finishingAtTimestamp < Date.now()) {
        setIsNavigating(false)
        return
      }
      setIsNavigating(true)
    }, 100)

    return () => {
      clearInterval(timer)
    }
  })

  return { isNavigating }
}
