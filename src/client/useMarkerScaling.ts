import { useAtomValue } from "jotai"
import { max } from "lodash-es"
import { useMemo, useState } from "react"
import { mapRadiusInKmAtom } from "./MapBase"

export const useMarkerScaling = () => {
  const [hovering, setHovering] = useState(false)
  const mapRadius = useAtomValue(mapRadiusInKmAtom)
  let scale = 1
  scale = max([0.4, +((scale * 0.5) / Math.sqrt(mapRadius)).toFixed(2)])!
  if (hovering) {
    scale = 3
  }

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
