import NiceModal from "@ebay/nice-modal-react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { BattleViewModal } from "./BattleViewModal"
import { FighterChip } from "./FighterChip"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { Button } from "./shadcn/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./shadcn/ui/tabs"
import { usePlayer } from "./usePlayer"

export const PlaceViewDungeon = ({ placeId }: { placeId: string }) => {
  const { playerId } = usePlayer()

  const trpc = api.useContext()
  const { mutateAsync: startDungeon } = api.dungeon.startDungeon.useMutation({
    onSuccess: (data) => {
      trpc.battle.invalidate()
      NiceModal.show(BattleViewModal, {
        battleId: data.battleId,
      })
    },
  })

  const { data: highscores } = api.dungeon.getHighscore.useQuery(
    {
      placeId,
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )

  const { data: fighters } = api.dungeon.getFighters.useQuery(
    {
      placeId,
      playerId: playerId!,
    },
    {
      enabled: !!playerId,
    }
  )

  return (
    <>
      <Button
        onClick={() => {
          if (!playerId) return
          const promise = startDungeon({ placeId, playerId })
          toast.promise(promise, {
            loading: "Entering dungeon...",
            success: "Dungeon entered!",
            error: (err: any) => err?.message || "Failed to enter dungeon",
          })
        }}
      >
        <TorchIcon className="w-6 h-6 rotate-45" />
        <span className="ml-2">Enter Dungeon</span>
      </Button>
      <Tabs defaultValue="highscore" className="">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="highscore">Highscore</TabsTrigger>
          <TabsTrigger value="fighters">Wildlife</TabsTrigger>
        </TabsList>

        <TabsContent value="highscore">
          {!highscores?.length && (
            <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
              No one has ever beaten this dungeon. Be the first!
            </div>
          )}
          <div className="flex flex-col gap-2">
            {highscores?.map((hs, idx) => {
              return (
                <button
                  key={hs.player.id}
                  className="p-2 rounded bg-gray-200 hover:bg-gray-300 flex flex-row gap-4"
                  onClick={() => {
                    NiceModal.show(BattleViewModal, {
                      battleId: hs.battleId,
                    })
                  }}
                >
                  <div>#{idx + 1}</div>
                  <div className="flex-1 truncate">{hs.player.name}</div>
                  <div>Tier {hs.tier}</div>
                </button>
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="fighters">
          {!fighters?.length && (
            <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
              Explore the dungeons to find out about the Wildlife in there!
            </div>
          )}
          <div className="flex flex-col">
            {fighters?.map(({ fighter, battleId, tier }, idx) => {
              return (
                <button
                  key={idx}
                  className="rounded flex flex-row flex-wrap gap-4 items-center p-2 border-b text-left hover:bg-gray-100"
                  onClick={() => {
                    NiceModal.show(BattleViewModal, {
                      battleId,
                    })
                  }}
                >
                  <div className="w-16">
                    Tier <strong>{tier}</strong>
                  </div>
                  <div className="w-20 flex flex-col gap-1">
                    <FighterTypeBadges fighter={{ fighter }} showTypes />
                  </div>
                  <div className="flex-1">
                    <FighterChip
                      fighter={{ fighter }}
                      showAbsoluteHp={false}
                      ltr={false}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

const TorchIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M8.6 9.6c.4.6.9 1.1 1.6 1.4h4c.3-.1.5-.3.7-.5c1-1 1.4-2.5.9-3.8l-.1-.2c-.1-.3-.3-.5-.5-.7c-.1-.2-.3-.3-.4-.5c-.4-.3-.8-.6-1.2-1c-.9-.9-1-2.3-.5-3.3c-.5.1-1 .4-1.4.8C10.2 3 9.6 5.1 10.3 7v.2c0 .1-.1.2-.2.3c-.1.1-.3 0-.4-.1l-.1-.1c-.6-.8-.7-2-.3-3c-.9.8-1.4 2.1-1.3 3.4c0 .3.1.6.2.9c0 .3.2.7.4 1m3.7-1.5c.1-.5-.1-.9-.2-1.3s-.1-.8.1-1.2l.3.6c.4.6 1.1.8 1.3 1.6v.3c0 .5-.2 1-.5 1.3c-.2.1-.4.3-.6.3c-.6.2-1.3-.1-1.7-.5c.8 0 1.2-.6 1.3-1.1M15 12v2h-1l-1 8h-2l-1-8H9v-2h6Z"
      />
    </svg>
  )
}
