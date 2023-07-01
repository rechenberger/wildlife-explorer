import { Map } from "react-map-gl"
import { env } from "~/env.mjs"

export default function Page() {
  return (
    <>
      <main className="flex h-[100svh] w-full">
        <Map
          mapLib={import("mapbox-gl")}
          initialViewState={{
            latitude: 50.928435947011906,
            longitude: 6.930087265110956,
            pitch: 45,
            zoom: 15,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          // mapStyle="mapbox://styles/rechenberger/cljkelien006n01o429b9440e"
          mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
          onMove={(e) => console.log(e)}
        />
      </main>
    </>
  )
}
