import { BattleViewButton } from "./BattleViewButton"
import { MainNavigationButton } from "./MainNavigationButton"
import { MyCatchesButton } from "./MyCatchesButton"
import { ScanButton } from "./ScanButton"
import { SettingsButton } from "./SettingsButton"
import { SocialOverviewButton } from "./SocialOverviewButton"

export const MainActionButtons = () => {
  return (
    <>
      <div
        className="absolute inset-x-2 bottom-1 z-40 flex flex-row justify-center"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 0.25rem)",
        }}
      >
        <div className="flex flex-col gap-4 w-min">
          <MainNavigationButton />
          <div className="flex flex-row gap-4 justify-center ">
            <ScanButton />
            <BattleViewButton />
            <MyCatchesButton />
            <SocialOverviewButton />
            <SettingsButton />
            {/* <TeleportToCurrentPositionButton /> */}
          </div>
        </div>
      </div>
    </>
  )
}
