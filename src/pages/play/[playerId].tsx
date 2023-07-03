import { CurrentObservation } from "~/client/CurrentObservation"
import { Eta } from "~/client/Eta"
import { MainActionButtons } from "~/client/MainActionButtons"
import { MainLayout } from "~/client/MainLayout"
import { MapBase } from "~/client/MapBase"
import { OtherPlayers } from "~/client/OtherPlayers"
import { ScanCircle } from "~/client/ScanCircle"
import { WalkerMarker } from "~/client/WalkerMarker"
import { WalkerRoute } from "~/client/WalkerRoute"
import { WildlifeMarkers } from "~/client/WildlifeMarkers"
import { usePlayer } from "~/client/usePlayer"

export default function Page() {
  usePlayer()
  return (
    <MainLayout>
      <MapBase>
        <ScanCircle />
        <Eta />
        <WildlifeMarkers />
        <OtherPlayers />
        <WalkerRoute />
        <WalkerMarker />
        <CurrentObservation />
        <MainActionButtons />
      </MapBase>
    </MainLayout>
  )
}
