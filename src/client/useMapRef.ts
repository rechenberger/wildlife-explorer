import { type FlyToOptions } from "mapbox-gl"
import { createContext, useContext } from "react"
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
  return (options: FlyToOptions) => {
    if (ref.current) {
      ref.current.flyTo(options)
    } else {
      console.warn("MapRef not found")
    }
  }
}
