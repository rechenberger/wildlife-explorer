import { Swords } from "lucide-react"
import { api } from "~/utils/api"
import { Button } from "./shadcn/ui/button"
import { useMapFlyTo } from "./useMapRef"
import { usePlayer } from "./usePlayer"

export const PlaceViewDungeon = ({ placeId }: { placeId: string }) => {
  const { playerId } = usePlayer()

  const trpc = api.useContext()
  const { mutateAsync: fly } = api.dungeon.startDungeon.useMutation({
    onSuccess: () => {
      trpc.battle.invalidate()
    },
  })

  const mapFlyTo = useMapFlyTo()

  return (
    <>
      <Button>
        <Swords className="w-4 h-4" />
        <span className="ml-2">Start Dungeon</span>
      </Button>
    </>
  )
}
