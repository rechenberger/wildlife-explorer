import { CurrentObservation } from "~/client/CurrentObservation"
import { Eta } from "~/client/Eta"
import { MainLayout } from "~/client/MainLayout"
import { MapBase } from "~/client/MapBase"
import { OtherPlayers } from "~/client/OtherPlayers"
import { WalkerMarker } from "~/client/WalkerMarker"
import { WalkerRoute } from "~/client/WalkerRoute"
import { WildlifeMarkers } from "~/client/WildlifeMarkers"
import { usePlayer } from "~/client/usePlayer"

export default function Page() {
  usePlayer()
  return (
    <MainLayout>
      <MapBase>
        <Eta />
        <WildlifeMarkers />
        <OtherPlayers />
        <WalkerRoute />
        <WalkerMarker />
        <CurrentObservation />
      </MapBase>
    </MainLayout>
  )
}
