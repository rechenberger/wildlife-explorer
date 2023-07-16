import { BattleViewButton } from "./BattleViewButton"
import { MyCatchesButton } from "./MyCatchesButton"
import { ScanButton } from "./ScanButton"
import { SettingsButton } from "./SettingsButton"
import { SocialOverviewButton } from "./SocialOverviewButton"

export const MainActionButtons = () => {
  return (
    <>
      <div
        className="absolute inset-x-2 bottom-1 z-40 flex flex-row justify-center gap-4"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 0.25rem)",
        }}
      >
        <ScanButton />
        <BattleViewButton />
        <MyCatchesButton />
        <SocialOverviewButton />
        <SettingsButton />
        {/* <TeleportToCurrentPositionButton /> */}
      </div>
    </>
  )
}
