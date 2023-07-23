import NiceModal from "@ebay/nice-modal-react"
import { Eta } from "~/client/Eta"
import { GlobalKeyboardShortcuts } from "~/client/GlobalKeyboardShortcuts"
import { MainActionButtons } from "~/client/MainActionButtons"
import { MainLayout } from "~/client/MainLayout"
import { MapBase } from "~/client/MapBase"
import { OtherPlayers } from "~/client/OtherPlayers"
import { PlaceMarkers } from "~/client/PlaceMarkers"
import { PlayerMarker } from "~/client/PlayerMarker"
import { PlayerRoute } from "~/client/PlayerRoute"
import { ScanCircle } from "~/client/ScanCircle"
import { WildlifeMarkers } from "~/client/WildlifeMarkers"
import { WildlifeNearMe } from "~/client/WildlifeNearMe"
import { usePlayer } from "~/client/usePlayer"

export default function Page() {
  const { player } = usePlayer()
  return (
    <MainLayout>
      <MapBase>
        <NiceModal.Provider>
          <ScanCircle />
          <Eta />
          <WildlifeMarkers />
          <PlaceMarkers />
          <OtherPlayers />
          {player && <PlayerRoute player={player} isMe />}
          {player && <PlayerMarker player={player} isMe />}
          {/* {ENABLE_BATTLE_VIEW && <BattleView />} */}
          <MainActionButtons />
          <WildlifeNearMe />
          <GlobalKeyboardShortcuts />
        </NiceModal.Provider>
      </MapBase>
    </MainLayout>
  )
}
