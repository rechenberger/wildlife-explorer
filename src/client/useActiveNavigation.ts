import { useEffect, useState } from "react"
import { usePlayer } from "./usePlayer"

export const useActiveNavigation = () => {
  const { player } = usePlayer()

  const [isNavigating, setIsNavigating] = useState(false)
  const [eta, setEta] = useState<Date | null>(null)

  useEffect(() => {
    if (!player) return

    const timer = setInterval(() => {
      const navigation = player.metadata?.navigation
      if (!navigation || navigation.finishingAtTimestamp < Date.now()) {
        setIsNavigating(false)
        setEta(null)
        return
      }
      setIsNavigating(true)
      setEta(new Date(navigation.finishingAtTimestamp))
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [player])

  return { isNavigating, eta }
}
