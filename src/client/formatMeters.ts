export const formatMeters = (meters: number) => {
  if (meters < 1000) {
    return `${meters}m`
  } else if (meters < 10_000) {
    return `${(meters / 1000).toFixed(1)}km`
  } else {
    return `${(meters / 1000).toFixed(0)}km`
  }
}
