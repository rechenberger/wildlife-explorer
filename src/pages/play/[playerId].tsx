import { CurrentObservation } from "~/client/CurrentObservation"
import { Eta } from "~/client/Eta"
import { MainActionButtons } from "~/client/MainActionButtons"
import { MainLayout } from "~/client/MainLayout"
import { MapBase } from "~/client/MapBase"
import { MapControls } from "~/client/MapControls"
import { OtherPlayers } from "~/client/OtherPlayers"
import { PlayerMarker } from "~/client/PlayerMarker"
import { PlayerRoute } from "~/client/PlayerRoute"
import { ScanCircle } from "~/client/ScanCircle"
import { WildlifeMarkers } from "~/client/WildlifeMarkers"
import { usePlayer } from "~/client/usePlayer"

export default function Page() {
  const { player } = usePlayer()
  return (
    <MainLayout>
      <MapBase>
        <ScanCircle />
        <Eta />
        <WildlifeMarkers />
        <OtherPlayers />
        {player && <PlayerRoute player={player} isMe />}
        {player && <PlayerMarker player={player} isMe />}
        <CurrentObservation />
        <MainActionButtons />
        <MapControls />
      </MapBase>
    </MainLayout>
  )
}
