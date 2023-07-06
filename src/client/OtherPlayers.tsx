import { map } from "lodash-es"
import { Fragment } from "react"
import { OTHER_PLAYER_REFETCH_INTERVAL_IN_MS } from "~/config"
import { api } from "~/utils/api"
import { PlayerMarker } from "./PlayerMarker"
import { usePlayer } from "./usePlayer"

export const OtherPlayers = () => {
  const { playerId } = usePlayer()
  const { data: otherPlayers } = api.player.others.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
      refetchInterval: OTHER_PLAYER_REFETCH_INTERVAL_IN_MS,
    }
  )

  return (
    <>
      {map(otherPlayers, (player) => {
        return (
          <Fragment key={player.id}>
            <PlayerMarker player={player} />
            {/* <PlayerRoute player={player} /> */}
          </Fragment>
        )
      })}
    </>
  )
}
