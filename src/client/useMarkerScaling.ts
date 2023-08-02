import { useAtomValue } from "jotai"
import { max } from "lodash-es"
import { useMemo, useState } from "react"
import { mapRadiusInKmAtom } from "./MapBase"

export const useMarkerScaling = () => {
  const mapRadius = useAtomValue(mapRadiusInKmAtom)
  const markerScalingByMapRadius = useMemo(() => {
    let scale = 1
    scale = max([0.4, +((scale * 0.5) / Math.sqrt(mapRadius)).toFixed(2)])!
    return scale
  }, [mapRadius])

  return markerScalingByMapRadius
}

export const useMarkerScalingProps = () => {
  const markerScalingByMapRadius = useMarkerScaling()
  const [hovering, setHovering] = useState(false)
  const scale = hovering ? 3 : markerScalingByMapRadius
  const markerScalingProps = useMemo(
    () => ({
      style: {
        transform: `scale(${scale})`,
      },
      onMouseEnter: () => setHovering(true),
      onMouseLeave: () => setHovering(false),
    }),
    [scale]
  )

  return { markerScalingProps }
}
