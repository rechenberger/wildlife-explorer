import { useSetAtom, useStore } from "jotai"
import { useCallback } from "react"
import { playerLocationAtom } from "./WalkerMarker"
import { calcNavigationAtom } from "./WalkerRoute"

export const useNavigation = () => {
  const store = useStore()
  const calcNavigation = useSetAtom(calcNavigationAtom)

  const navigate = useCallback(
    async ({ lat, lng }: { lat: number; lng: number }) => {
      await calcNavigation([
        {
          from: store.get(playerLocationAtom),
          to: {
            lat,
            lng,
          },
        },
      ])
    },
    [calcNavigation, store]
  )

  return { navigate }
}
