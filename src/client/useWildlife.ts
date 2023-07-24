import { filter, orderBy } from "lodash-es"
import { useMemo } from "react"
import { WILDLIFE_REFETCH_INTERVAL_IN_MS } from "~/config"
import { api } from "~/utils/api"
import { usePlayer } from "./usePlayer"

export const useWildlife = () => {
  const { playerId } = usePlayer()
  const { data: wildlife, isFetching } = api.wildlife.nearMe.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      keepPreviousData: true,
      refetchInterval: WILDLIFE_REFETCH_INTERVAL_IN_MS,
    }
  )
  return {
    wildlife,
    isFetching,
  }
}

export const useWildlifeToBattle = () => {
  const { wildlife } = useWildlife()
  const wildlifeSorted = useMemo(() => {
    let result = wildlife
    result = filter(result, (w) => w.wildlife.inRange)
    result = filter(result, (w) => !w.wildlife.caughtAt)
    result = orderBy(result, [(w) => w.fighter.level], ["desc"])
    return result
  }, [wildlife])
  return wildlifeSorted
}
