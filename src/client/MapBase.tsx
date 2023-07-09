import { atom, useSetAtom } from "jotai"
import { debounce } from "lodash-es"
import { useMemo, useRef, type ReactNode } from "react"
import { Map, type MapRef } from "react-map-gl"
import { DEFAULT_LOCATION } from "~/config"
import { env } from "~/env.mjs"
import { MapRefProvider } from "./useMapRef"
import { useNavigation } from "./useNavigation"

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

const latLngFromHash = () => {
  if (typeof window === "undefined") return null
  const hash = window.location.hash
  if (!hash) return null
  const [lat, lng] = hash.slice(1).split(",")
  if (!lat || !lng) return null
  return { lat: parseFloat(lat), lng: parseFloat(lng) }
}

export const MapBase = ({
  children,
  isOverview,
}: {
  children?: ReactNode
  isOverview?: boolean
}) => {
  const setMapState = useSetAtom(mapStateAtom)

  const setMapStateDebounced = useMemo(() => {
    return debounce(
      (newState: { lat: number; lng: number; radiusInKm: number }) => {
        setMapState(newState)
      },
      100
    )
  }, [setMapState])

  const { navigate } = useNavigation()

  const latLng = latLngFromHash() || DEFAULT_LOCATION

  const ref = useRef<MapRef | null>(null)

  // useEffect(() => {
  //   ref.current?.setCenter()
  // })

  return (
    <>
      <Map
        ref={ref}
        mapLib={import("mapbox-gl")}
        initialViewState={{
          latitude: latLng.lat,
          longitude: latLng.lng,
          pitch: isOverview ? 0 : 45,
          zoom: isOverview ? 2 : 16,
        }}
        style={{ width: "100%", height: "100%" }}
        projection={"globe" as any}
        logoPosition="top-right"
        attributionControl={false}
        // mapStyle="mapbox://styles/mapbox/streets-v9"
        // mapStyle="mapbox://styles/mapbox/dark-v10"
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        // mapStyle="mapbox://styles/rechenberger/cljkelien006n01o429b9440e"
        // mapStyle="mapbox://styles/rechenberger/cljklaom7007001r5hfwlcrfu"
        mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
        onMove={(e) => {
          setMapStateDebounced({
            lat: e.viewState.latitude,
            lng: e.viewState.longitude,
            radiusInKm: calculateRadiusFromZoomLevel(e.viewState.zoom),
          })
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
