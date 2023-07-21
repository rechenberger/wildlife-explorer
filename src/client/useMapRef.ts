import { type FlyToOptions } from "mapbox-gl"
import { createContext, useCallback, useContext } from "react"
import { type MapRef } from "react-map-gl"

const Context = createContext({
  current: null as null | MapRef,
})

export const MapRefProvider = Context.Provider
export const useMapRef = () => {
  const context = useContext(Context)
  return context
}

export const useMapFlyTo = () => {
  const ref = useMapRef()
  return useCallback(
    (options: FlyToOptions & { instant?: boolean }) => {
      if (ref.current) {
        if (options.instant) {
          if (options.center) ref.current.setCenter(options.center)
          if (options.zoom) ref.current.setZoom(options.zoom)
          if (options.pitch) ref.current.setPitch(options.pitch)
        } else {
          ref.current.flyTo(options)
        }
      } else {
        console.warn("MapRef not found")
      }
    },
    [ref]
  )
}
