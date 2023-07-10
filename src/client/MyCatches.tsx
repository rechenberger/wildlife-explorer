import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import { api } from "~/utils/api"
import { CatchDetailsModal } from "./CatchDetailsModal"
import { FighterChip } from "./FighterChip"
import { useMyTeam } from "./useMyTeam"
import { usePlayer } from "./usePlayer"

export const MyCatches = () => {
  const { playerId } = usePlayer()

  const { myTeam, catchesWithoutTeam } = useMyTeam()

  const trpc = api.useContext()

  const { mutate: setMyTeamBattleOrder } =
    api.catch.setMyTeamBattleOrder.useMutation({
      onSuccess: () => {
        trpc.catch.getMyCatches.invalidate()
      },
    })

  const isDefaultSwap = true

  const addToTeamAtPos = ({
    position,
    catchId,
    isSwapWithCurrentPosition = isDefaultSwap,
  }: {
    position: number
    catchId: string
    isSwapWithCurrentPosition?: boolean
  }) => {
    if (!playerId) return
    const currentTeamOrder = myTeam.map((c) => c.id)

    let newTeamOrder: string[] = []

    if (isSwapWithCurrentPosition) {
      const catchIdAtPos = currentTeamOrder[position - 1]
      if (!catchIdAtPos) {
        newTeamOrder = [...currentTeamOrder, catchId]
      } else {
        const catchIdIsAlreadyInTeam = myTeam.some((c) => c.id === catchId)

        newTeamOrder = [...currentTeamOrder]
        newTeamOrder[position - 1] = catchId

        if (catchIdIsAlreadyInTeam) {
          newTeamOrder[currentTeamOrder.indexOf(catchId)] = catchIdAtPos
        }
      }
    } else {
      const currentTeamWithoutCatchId = currentTeamOrder.filter(
        (cId) => cId !== catchId
      )
      newTeamOrder = [
        ...currentTeamWithoutCatchId.slice(0, position - 1),
        catchId,
        ...currentTeamWithoutCatchId.slice(position - 1),
      ]
    }

    setMyTeamBattleOrder({
      teamIds: newTeamOrder,
      playerId,
    })
  }

  return (
    <>
      <div className="mb-4">Your Team</div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2">
        {map(myTeam, (c, idx) => (
          <div
            key={c.id}
            className="flex cursor-pointer flex-col p-1"
            onClick={(e) => {
              if (e.shiftKey) {
                NiceModal.show(CatchDetailsModal, {
                  catchId: c.id,
                })
                return
              }
              const newPos = parseInt(prompt("Enter new position") as string)
              addToTeamAtPos({
                position: newPos,
                catchId: c.id,
              })
            }}
          >
            <FighterChip showAbsoluteHp ltr grayscale={false} fighter={c} />
            {/* <div></div> */}
          </div>
        ))}
      </div>
      <div className="mb-4">Your Catches</div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 gap-y-3 p-2">
        {map(catchesWithoutTeam, (c) => (
          <div
            key={c.id}
            className="flex cursor-pointer flex-col p-1"
            onClick={(e) => {
              if (e.shiftKey) {
                NiceModal.show(CatchDetailsModal, {
                  catchId: c.id,
                })
                return
              }

              const newPos = parseInt(prompt("Enter new position") as string)
              addToTeamAtPos({
                position: newPos,
                catchId: c.id,
              })
              // if (!playerId) return
              // setBattleOrderPosition({
              //   catchId: c.id,
              //   playerId,
              // })
            }}
          >
            <FighterChip showAbsoluteHp ltr grayscale={true} fighter={c} />
            {/* <div></div> */}
          </div>
        ))}
      </div>
    </>
  )
}
