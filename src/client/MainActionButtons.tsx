import { BattleViewButton } from "./BattleViewButton"
import { ScanButton } from "./ScanButton"

export const MainActionButtons = () => {
  return (
    <>
      <div className="absolute inset-x-8 bottom-8 z-40 flex flex-row justify-center gap-2">
        <ScanButton />
        <BattleViewButton />
        {/* <TeleportToCurrentPositionButton /> */}
      </div>
    </>
  )
}
