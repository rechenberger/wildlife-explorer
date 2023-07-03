import { map, orderBy } from "lodash-es"
import { ArrowLeft, User } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { api } from "~/utils/api"
import { LocaleSelectMini } from "./LocaleSelectMini"
import { LoginButton } from "./LoginButton"
import { PlayerCreationForm } from "./PlayerCreationForm"
import { TimeAgo } from "./TimeAgo"
import { cn } from "./cn"

export const PlayerSelection = () => {
  const session = useSession()
  const isLoggedIn = !!session.data
  const [creating, setCreating] = useState(false)
  const title = isLoggedIn
    ? creating
      ? "Create Character"
      : "Choose Character"
    : "Welcome"
  const { data: players, isInitialLoading } = api.player.getMyPlayers.useQuery(
    undefined,
    {
      onSuccess: (players) => {
        if (!players.length) {
          setCreating(true)
        }
      },
      enabled: isLoggedIn,
    }
  )

  if (session.status === "loading" || isInitialLoading) return null

  return (
    <>
      <div className="fixed flex w-full max-w-xs flex-col rounded-xl bg-white text-black shadow md:max-w-sm">
        <div
          className={cn(
            "flex flex-row items-center gap-2 p-4",
            isLoggedIn && "border-b"
          )}
        >
          {creating && (
            <button onClick={() => setCreating(false)}>
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="flex-1">{title}</div>
          {isLoggedIn && <LocaleSelectMini />}
          <LoginButton />
        </div>
        {creating && <PlayerCreationForm />}
        {!creating &&
          isLoggedIn &&
          map(
            orderBy(players, (p) => p.updatedAt, "desc"),
            (player) => (
              <Link
                href={`/play/${player.id}#${player.lat},${player.lng}`}
                className="flex flex-row items-center gap-2 border-b p-4 text-left hover:bg-black/10"
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
        {!creating && isLoggedIn && (
          <button
            onClick={() => setCreating(true)}
            className="m-4 rounded bg-black px-2 py-1 text-center text-sm text-white"
          >
            Create New Character
          </button>
        )}
      </div>
    </>
  )
}
