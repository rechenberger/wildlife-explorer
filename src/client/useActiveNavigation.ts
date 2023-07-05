import { useEffect, useMemo, useState } from "react"
import { usePlayer } from "./usePlayer"

export const useActiveNavigation = () => {
  const { player } = usePlayer()

  const [isNavigating, setIsNavigating] = useState(false)
  const [eta, setEta] = useState<Date | null>(null)

  useEffect(() => {
    if (!player) return

    const timer = setInterval(() => {
      const timestamp = player.metadata?.navigation?.finishingAtTimestamp
      if (!timestamp || timestamp < Date.now()) {
        setIsNavigating(false)
        setEta(null)
        return
      }
      // console.log("timestamp", new Date(timestamp))
      setIsNavigating(true)
      setEta(new Date(timestamp))
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [player])

  const etaIso = useMemo(() => {
    if (!eta) return null
    return eta.toISOString()
  }, [eta])

  return { isNavigating, etaIso }
}
