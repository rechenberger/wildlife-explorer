import { filter } from "lodash-es"
import { useMyCatches } from "./useCatches"

export const useMyTeam = () => {
  const { myCatches } = useMyCatches()

  const myTeam = filter(myCatches, (c) => c.battleOrderPosition !== null)
  const catchesWithoutTeam = filter(
    myCatches,
    (c) => c.battleOrderPosition === null
  )

  return {
    myTeam,
    catchesWithoutTeam,
  }
}
