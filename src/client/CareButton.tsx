import { HeartPulse } from "lucide-react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { Button } from "./shadcn/ui/button"
import { usePlayer } from "./usePlayer"

export const useCare = () => {
  const { playerId } = usePlayer()
  const trpc = api.useContext()

  const { mutateAsync, isLoading } = api.catch.care.useMutation({
    onSuccess: () => {
      trpc.catch.invalidate()
    },
  })
  const care = () => {
    if (!playerId) return
    toast.promise(mutateAsync({ playerId }), {
      loading: "Caring...",
      success: (data) =>
        data.count
          ? `Cared for ${data.count}! ❤️ HP and PP reset.`
          : `Your team is already doing great!`,
      error: (err) => err?.message || "Failed to care",
    })
  }

  return { care, isLoading }
}

export const CareButton = () => {
  const { care, isLoading } = useCare()
  return (
    <>
      <Button onClick={care} disabled={isLoading}>
        <HeartPulse className="w-4 h-4 mr-2" />
        <span>Care for my Team</span>
      </Button>
    </>
  )
}
