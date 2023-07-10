import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import { MAX_FIGHTERS_PER_TEAM } from "~/config"
import { api } from "~/utils/api"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { FighterChip } from "./FighterChip"
import { useMyCatches } from "./useCatches"
import { usePlayer } from "./usePlayer"

export const MyCatches = () => {
  const { playerId } = usePlayer()
  const { myCatches } = useMyCatches()

  const trpc = api.useContext()
  const { mutate: setBattleOrderPosition } =
    api.catch.setBattleOrderPosition.useMutation({
      onSuccess: () => {
        trpc.catch.getMyCatches.invalidate()
      },
    })

  return (
    <>
      <div className="mb-4">Your Catches</div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2">
        {map(myCatches, (c, idx) => (
          <div
            key={c.id}
            className="flex cursor-pointer flex-col p-1"
            onClick={() => {
              // if (!playerId) return
              // setBattleOrderPosition({
              //   catchId: c.id,
              //   playerId,
              // })
              NiceModal.show(CatchDetailsModal, {
                catchId: c.id,
              })
            }}
          >
            <FighterChip
              showAbsoluteHp
              ltr
              grayscale={idx >= MAX_FIGHTERS_PER_TEAM}
              fighter={c}
            />
            {/* <div></div> */}
          </div>
        ))}
      </div>
    </>
  )
}
