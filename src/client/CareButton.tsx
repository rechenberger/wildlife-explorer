import { HeartPulse } from "lucide-react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { Button } from "./shadcn/ui/button"
import { usePlayer } from "./usePlayer"

export const CareButton = () => {
  const { playerId } = usePlayer()
  const trpc = api.useContext()

  const { mutateAsync: care, isLoading } = api.catch.care.useMutation({
    onSuccess: () => {
      trpc.catch.invalidate()
    },
  })

  return (
    <>
      <Button
        onClick={() => {
          if (!playerId) return
          toast.promise(care({ playerId }), {
            loading: "Caring...",
            success: (data) =>
              data.count
                ? `Cared for ${data.count}! ❤️ HP and PP reset.`
                : `Your team is already doing great!`,
            error: (err) => err?.message || "Failed to care",
          })
        }}
        disabled={isLoading}
      >
        <HeartPulse className="w-4 h-4 mr-1" />
        <span>Care</span>
      </Button>
    </>
  )
}
