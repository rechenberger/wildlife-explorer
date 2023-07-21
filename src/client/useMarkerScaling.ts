import { useAtomValue } from "jotai"
import { useState } from "react"
import { mapRadiusInKmAtom } from "./MapBase"

export const useMarkerScaling = () => {
  const [hovering, setHovering] = useState(false)
  const mapRadius = useAtomValue(mapRadiusInKmAtom)
  let scale = 1
  scale = (scale * 0.5) / Math.sqrt(mapRadius)
  if (hovering) {
    scale = 3
  }

  const markerScalingProps = {
    style: {
      transform: `scale(${scale})`,
    },
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
  }

  return { markerScalingProps }
}
