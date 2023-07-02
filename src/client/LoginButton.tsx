import { ArrowUp } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"

export const LoginButton = () => {
  const session = useSession()

  if (!session.data)
    return (
      <>
        <button
          className="flex flex-row items-center gap-2 rounded bg-black px-2 py-1 text-sm text-white"
          onClick={() => signIn("discord")}
        >
          <div className="rotate-90">
            <ArrowUp size={14} className="animate-bounce" />
          </div>
          <div>Login with Discord</div>
        </button>
      </>
    )

  return (
    <>
      <button
        className="rounded bg-black px-2 py-1 text-sm text-white"
        onClick={() => signOut()}
      >
        Logout
      </button>
    </>
  )
}
