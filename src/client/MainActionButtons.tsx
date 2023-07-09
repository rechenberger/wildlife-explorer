import { BattleViewButton } from "./BattleViewButton"
import { MyCatchesButton } from "./MyCatchesButton"
import { ScanButton } from "./ScanButton"

export const MainActionButtons = () => {
  return (
    <>
      <div className="absolute inset-x-2 bottom-1 z-40 flex flex-row justify-center gap-4">
        <ScanButton />
        <BattleViewButton />
        <MyCatchesButton />
        {/* <TeleportToCurrentPositionButton /> */}
      </div>
    </>
  )
}
