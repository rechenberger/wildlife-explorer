import { atom, useSetAtom } from "jotai"
import { debounce } from "lodash-es"
import { useMemo, useRef, type ReactNode } from "react"
import { Map, type MapRef } from "react-map-gl"
import { DEFAULT_LOCATION } from "~/config"
import { env } from "~/env.mjs"
import { stickToPlayerAtom } from "./MainNavigationButton"
import { MapRefProvider } from "./useMapRef"
import { useNavigation } from "./useNavigation"
import { useSettingsMapStyle } from "./useSettingsMapStyle"

export const mapStateAtom = atom({
  lat: DEFAULT_LOCATION.lat,
  lng: DEFAULT_LOCATION.lng,
  radiusInKm: 0.5,
})

function calculateRadiusFromZoomLevel(zoomLevel: number): number {
  const earthCircumferenceKm = 40075.017
  const radiusAtZoom0 = earthCircumferenceKm / 1
  return radiusAtZoom0 / Math.pow(2, zoomLevel)
}

export const MapBase = ({
  children,
  isOverview,
}: {
  children?: ReactNode
  isOverview?: boolean
}) => {
  const setMapState = useSetAtom(mapStateAtom)
  const setStickToPlayer = useSetAtom(stickToPlayerAtom)

  const setMapStateDebounced = useMemo(() => {
    return debounce(
      (newState: { lat: number; lng: number; radiusInKm: number }) => {
        setMapState(newState)
      },
      100
    )
  }, [setMapState])

  const { navigate } = useNavigation()

  const latLng = DEFAULT_LOCATION

  const ref = useRef<MapRef | null>(null)

  const { mapStyle } = useSettingsMapStyle()

  return (
    <>
      <Map
        ref={ref}
        mapLib={import("mapbox-gl")}
        initialViewState={{
          latitude: latLng.lat,
          longitude: latLng.lng,
          pitch: 0,
          zoom: 2,
        }}
        style={{ width: "100%", height: "100%" }}
        projection={"globe" as any}
        logoPosition="top-right"
        attributionControl={false}
        mapStyle={mapStyle.mapboxUrl}
        mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
        onMove={(e) => {
          setMapStateDebounced({
            lat: e.viewState.latitude,
            lng: e.viewState.longitude,
            radiusInKm: calculateRadiusFromZoomLevel(e.viewState.zoom),
          })
        }}
        // onZoom={() => {
        //   setStickToPlayer(false)
        // }}
        onDrag={() => {
          setStickToPlayer(false)
        }}
        onClick={(e) => {
          if (isOverview) return
          navigate(e.lngLat)
        }}
      >
        <MapRefProvider value={ref}>{children}</MapRefProvider>
      </Map>
    </>
  )
}
