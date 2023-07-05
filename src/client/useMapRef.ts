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
