import { toast } from "sonner"
import { api } from "~/utils/api"
import { confetti } from "./confetti"
import { usePlayer } from "./usePlayer"

export const useEvolve = () => {
  const { playerId } = usePlayer()
  const trpc = api.useContext()
  const { mutateAsync } = api.catch.evolve.useMutation({
    onSuccess: () => {
      trpc.catch.invalidate()
    },
  })
  const evolve = async ({
    catchId,
    catchName,
  }: {
    catchId: string
    catchName: string
  }) => {
    if (!playerId) return

    const promise = mutateAsync({ playerId, catchId })
    toast.promise(promise, {
      loading: `${catchName} is evolving...`,
      success: `Your ${catchName} evolved! ✨`,
      error: (error) => error.message,
    })

    await promise
    confetti({
      emojis: ["✨"],
    })
  }

  return { evolve }
}
