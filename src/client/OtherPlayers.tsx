import { map } from "lodash-es"
import { User2 } from "lucide-react"
import { Marker } from "react-map-gl"
import { OTHER_PLAYER_REFETCH_INTERVAL_IN_MS } from "~/config"
import { api } from "~/utils/api"
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
          <Marker
            key={player.id}
            latitude={player.lat}
            longitude={player.lng}
            anchor="center"
            style={{ zIndex: 25 }}
          >
            <div className="flex flex-col items-center">
              <div className="relative aspect-square rounded-full border-2 bg-purple-500 ring-2 ring-purple-400">
                <User2 size={24} className="animate text-white" />
                <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-purple-400" />
              </div>
              <div className="line-clamp-1 flex items-center overflow-visible whitespace-nowrap text-center text-purple-500">
                {player.name}
              </div>
            </div>
          </Marker>
        )
      })}
    </>
  )
}
