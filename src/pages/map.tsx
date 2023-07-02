import { MapBase } from "~/client/MapBase"
import { WalkerMarker } from "~/client/WalkerMarker"
import { WalkerRoute } from "~/client/WalkerRoute"
import { WildlifeMarkers } from "~/client/WildlifeMarkers"

export default function Page() {
  return (
    <>
      <main className="relative flex h-[100svh] w-full">
        <MapBase>
          <WalkerRoute />
          <WalkerMarker />
          <WildlifeMarkers />
        </MapBase>
      </main>
    </>
  )
}
