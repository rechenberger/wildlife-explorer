import { api, type RouterOutputs } from "~/utils/api"
import { FighterChip } from "./FighterChip"
import { usePlayer } from "./usePlayer"

type Wildlife = RouterOutputs["wildlife"]["nearMe"][number]

export const FighterChipByWildlife = ({
  w,
  showAbsoluteHp,
  ltr,
  enabled = true,
}: {
  w: Wildlife
  showAbsoluteHp: boolean
  ltr: boolean
  enabled?: boolean
}) => {
  const { playerId } = usePlayer()
  const { data: fighter } = api.wildlife.getFighter.useQuery(
    {
      playerId: playerId!,
      wildlifeId: w.id,
    },
    {
      enabled: !!playerId && enabled,
    }
  )

  if (!fighter) return null

  return (
    <FighterChip
      fighter={{
        fighter: fighter.fighter,
        wildlife: w,
      }}
      showAbsoluteHp={showAbsoluteHp}
      ltr={ltr}
    />
  )
}
