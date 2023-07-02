import { map } from "lodash-es"
import { User2 } from "lucide-react"
import { Marker } from "react-map-gl"
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
      refetchInterval: 1000,
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
          >
            <div className="relative aspect-square rounded-full border-2 bg-purple-500 ring-2 ring-purple-400">
              <User2 size={24} className="animate text-white" />
              <div className="absolute inset-0 animate-ping rounded-full ring-2 ring-purple-400" />
            </div>
          </Marker>
        )
      })}
    </>
  )
}
