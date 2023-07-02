import { atom, useSetAtom } from "jotai"
import { debounce } from "lodash-es"
import { useMemo, type ReactNode } from "react"
import { Map } from "react-map-gl"
import { env } from "~/env.mjs"

export const mapStateAtom = atom({
  lat: 50.928435947011906,
  lng: 6.930087265110956,
  radiusInKm: 0.5,
})

function calculateRadiusFromZoomLevel(zoomLevel: number): number {
  const earthCircumferenceKm = 40075.017
  const radiusAtZoom0 = earthCircumferenceKm / 1
  return radiusAtZoom0 / Math.pow(2, zoomLevel)
}

export const MapBase = ({ children }: { children?: ReactNode }) => {
  const setMapState = useSetAtom(mapStateAtom)

  const setMapStateDebounced = useMemo(() => {
    return debounce(
      (newState: { lat: number; lng: number; radiusInKm: number }) => {
        setMapState(newState)
      },
      100
    )
  }, [setMapState])

  return (
    <>
      <Map
        mapLib={import("mapbox-gl")}
        initialViewState={{
          latitude: 50.928435947011906,
          longitude: 6.930087265110956,
          pitch: 45,
          zoom: 15,
        }}
        style={{ width: "100%", height: "100%" }}
        // mapStyle="mapbox://styles/mapbox/streets-v9"
        // mapStyle="mapbox://styles/mapbox/dark-v10"
        mapStyle="mapbox://styles/rechenberger/cljkelien006n01o429b9440e"
        // mapStyle="mapbox://styles/rechenberger/cljklaom7007001r5hfwlcrfu"
        mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
        onMove={(e) => {
          setMapStateDebounced({
            lat: e.viewState.latitude,
            lng: e.viewState.longitude,
            radiusInKm: calculateRadiusFromZoomLevel(e.viewState.zoom),
          })
        }}
      >
        {children}
      </Map>
    </>
  )
}
