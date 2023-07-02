import { MainLayout } from "~/client/MainLayout"
import { MapBase } from "~/client/MapBase"
import { WalkerMarker } from "~/client/WalkerMarker"
import { WalkerRoute } from "~/client/WalkerRoute"
import { WildlifeMarkers } from "~/client/WildlifeMarkers"
import { usePlayer } from "~/client/usePlayer"

export default function Page() {
  usePlayer()
  return (
    <MainLayout>
      <MapBase>
        <WildlifeMarkers />
        <WalkerRoute />
        <WalkerMarker />
      </MapBase>
    </MainLayout>
  )
}
