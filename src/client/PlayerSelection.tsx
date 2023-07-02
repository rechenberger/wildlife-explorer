import { map, orderBy } from "lodash-es"
import { User } from "lucide-react"
import Link from "next/link"
import { api } from "~/utils/api"
import { LoginButton } from "./LoginButton"
import { TimeAgo } from "./TimeAgo"

export const PlayerSelection = () => {
  const { data: players } = api.player.getMyPlayers.useQuery()
  return (
    <>
      <div className="fixed flex w-full max-w-sm flex-col rounded-xl bg-white text-black shadow">
        <div className="flex flex-row gap-2 border-b p-4">
          <div className="flex-1">Choose Character</div>
          <LoginButton />
        </div>
        {map(
          orderBy(players, (p) => p.updatedAt, "desc"),
          (player) => (
            <Link
              href={`/play/${player.id}`}
              className="flex flex-row items-center gap-2 border-b p-4 text-left hover:bg-black/20"
            >
              <User size={24} />
              <div className="flex flex-col">
                <div>{player.name}</div>
                <div className="text-xs opacity-60">
                  <TimeAgo date={player.updatedAt} addSuffix={true} />
                </div>
              </div>
            </Link>
          )
        )}
        <Link
          href={"/player/create"}
          className="m-4 rounded bg-black px-2 py-1 text-center text-sm text-white"
        >
          Create New Character
        </Link>
      </div>
    </>
  )
}
