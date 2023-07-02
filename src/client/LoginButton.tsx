import { signIn, signOut, useSession } from "next-auth/react"

export const LoginButton = () => {
  const session = useSession()

  if (!session.data)
    return (
      <>
        <button className="rounded bg-black px-2 py-1" onClick={() => signIn()}>
          Login
        </button>
      </>
    )

  return (
    <>
      <button className="rounded bg-black px-2 py-1" onClick={() => signOut()}>
        Logout
      </button>
    </>
  )
}
