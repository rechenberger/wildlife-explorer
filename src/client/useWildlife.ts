import { filter, orderBy } from "lodash-es"
import { useMemo } from "react"
import { IV_SCORE_EXCEPTIONAL, WILDLIFE_REFETCH_INTERVAL_IN_MS } from "~/config"
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

export const useWildlifeToBattle = ({
  ignoreRange,
}: {
  ignoreRange?: boolean
} = {}) => {
  const { wildlife } = useWildlife()
  const wildlifeSorted = useMemo(() => {
    let result = wildlife
    if (!ignoreRange) {
      result = filter(result, (w) => w.wildlife.inRange)
    }
    result = filter(result, (w) => !w.wildlife.caughtAt)
    result = orderBy(
      result,
      [
        (w) =>
          !!w.fighter.ivScore && w.fighter.ivScore >= IV_SCORE_EXCEPTIONAL
            ? w.fighter.ivScore
            : 0,
        (w) => w.fighter.level,
      ],
      ["desc", "desc"]
    )
    return result
  }, [wildlife])
  return wildlifeSorted
}
