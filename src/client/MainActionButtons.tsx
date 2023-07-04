import { ScanButton } from "./ScanButton"
import { TeleportToCurrentPositionButton } from "./TeleportToCurrentPositionButton"

export const MainActionButtons = () => {
  return (
    <>
      <div className="absolute bottom-8 right-8 z-40 flex flex-row gap-2">
        <TeleportToCurrentPositionButton />
        <ScanButton />
      </div>
    </>
  )
}
