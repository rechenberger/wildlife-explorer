import { toast } from "sonner"
import { api } from "~/utils/api"
import { confetti } from "./confetti"
import { usePlayer } from "./usePlayer"

export const useCatch = () => {
  const { playerId } = usePlayer()

  const trpc = api.useContext()
  const { mutateAsync, isLoading } = api.catch.catch.useMutation({
    onSettled: () => {
      trpc.catch.invalidate()
      trpc.wildlife.invalidate()
      trpc.battle.invalidate()
    },
  })

  const doCatch = async ({ wildlifeId }: { wildlifeId: string }) => {
    if (!playerId) return

    const promise = mutateAsync({ wildlifeId, playerId })
    toast.promise(promise, {
      loading: "Catching...",
      success: "You caught it! 🎉",
      error: (err) => err.message || "Failed to catch. Try again.",
    })
    try {
      await promise
      confetti()
    } catch (error) {}
  }

  return { doCatch, isLoading }
}
