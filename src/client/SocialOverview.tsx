import { map } from "lodash-es"
import { User } from "lucide-react"
import { Fragment } from "react"
import { api } from "~/utils/api"
import { TimeAgo } from "./TimeAgo"
import { useMapSetCenter } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const SocialOverview = () => {
  const { playerId } = usePlayer()
  const { data: players } = api.social.getOverview.useQuery(
    {
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )

  const setMapCenter = useMapSetCenter()

  return (
    <>
      <div className="pb-4 px-4 border-b">Players</div>
      <div className="flex flex-col">
        {map(players, (player) => (
          <Fragment key={player.id}>
            <button
              className="flex flex-row items-center gap-2 border-b p-4 text-left hover:bg-black/10"
              onClick={() => {
                setMapCenter(player)
              }}
            >
              <User size={24} />
              <div className="flex flex-col">
                <div>{player.name}</div>
                <div className="text-xs opacity-60">
                  <TimeAgo date={player.updatedAt} addSuffix={true} />
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex flex-col text-xs opacity-60 text-right">
                <div>{player._count.foundWildlife} found</div>
                <div>{player._count.catches} caught</div>
                <div>{player._count.battleParticipations} defeated</div>
              </div>
            </button>
          </Fragment>
        ))}
      </div>
    </>
  )
}
