import NiceModal from "@ebay/nice-modal-react"
import { ArrowLeftRight } from "lucide-react"
import { Fragment } from "react"
import { type BattleReportFighter } from "~/server/lib/battle/BattleReport"
import { BattleFighterSelectModal } from "./BattleFighterSelectModal"
import { CatchDetails } from "./CatchDetails"
import { DividerHeading } from "./DividerHeading"
import { Button } from "./shadcn/ui/button"
import { useMakeChoice } from "./useMakeChoice"
import { usePlayer } from "./usePlayer"

export const BattleFighterSelect = ({
  fighters,
  battleId,
}: {
  fighters: BattleReportFighter[]
  battleId: string
}) => {
  const { playerId } = usePlayer()
  const { mutate: makeChoice } = useMakeChoice()
  return (
    <>
      <div className="">Select your next Fighter</div>
      <div className="flex flex-col gap-2">
        {fighters.map((fighter, idx) => {
          if (!fighter.catch) return null
          const canSwitch = !fighter.fainted && !fighter.fighter.isActive
          return (
            <Fragment key={idx}>
              <DividerHeading>Fighter #{idx + 1}</DividerHeading>
              <CatchDetails
                catchId={fighter.catch.id}
                showWildlife
                showTypes
                showMoves
                fighter={fighter}
                buttonSlot={
                  <>
                    {fighter.fighter.isActive ? (
                      <div className="font-bold text-green-500">Active</div>
                    ) : fighter.fainted ? (
                      <div className="italic text-red-500">Fainted</div>
                    ) : (
                      <Button
                        disabled={!canSwitch}
                        onClick={() => {
                          if (!canSwitch) return
                          if (!playerId) return
                          makeChoice({
                            playerId,
                            battleId,
                            choice: `switch ${idx + 1}`,
                          })
                          NiceModal.hide(BattleFighterSelectModal)
                        }}
                      >
                        <ArrowLeftRight className="w-4 h-4 mr-1" />
                        Go!
                      </Button>
                    )}
                  </>
                }
              />
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
