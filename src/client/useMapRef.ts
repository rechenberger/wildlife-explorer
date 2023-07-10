import { createContext, useContext } from "react"
import { type MapRef } from "react-map-gl"
import { type LatLng } from "~/server/schema/LatLng"

const Context = createContext({
  current: null as null | MapRef,
})

export const MapRefProvider = Context.Provider
export const useMapRef = () => {
  const context = useContext(Context)
  return context
}

export const useMapSetCenter = () => {
  const ref = useMapRef()
  return ({ lat, lng }: LatLng) => {
    if (ref.current) {
      ref.current.setCenter({ lat, lng })
    } else {
      console.warn("MapRef not found")
    }
  }
}
