import { MainLayout } from "~/client/MainLayout"
import { MapBase } from "~/client/MapBase"
import { WalkerMarker } from "~/client/WalkerMarker"
import { WalkerRoute } from "~/client/WalkerRoute"
import { WildlifeMarkers } from "~/client/WildlifeMarkers"

export default function Page() {
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
