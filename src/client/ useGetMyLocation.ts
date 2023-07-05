import { useCallback } from "react"
import { toast } from "sonner"
import { type LatLng } from "~/server/schema/LatLng"

export const useGetMyLocation = () => {
  const getMyLocation = useCallback(
    async ({
      maximumAge,
      timeout,
    }: {
      maximumAge?: number
      timeout?: number
    }) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by this browser.")
        return null
      }
      const promise = new Promise<LatLng>((resolve, reject) => {
        // setTimeout(() => {
        //   reject(new Error("Timed out"))
        // }, 10000)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            resolve({ lat: latitude, lng: longitude })
          },
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject({
                  message: "User denied the request for Geolocation.",
                })
                break
              case error.POSITION_UNAVAILABLE:
                reject({ message: "Location information is unavailable." })
                break
              case error.TIMEOUT:
                reject({
                  message: "The request to get user location timed out.",
                })
                break
              default:
                reject(error)
            }
            reject(error)
          },
          {
            maximumAge, // Accept a cached (old) position
            timeout,
          }
        )
      })
      toast.promise(promise, {
        loading: "Getting your location...",
        success: "Got your location!",
        error: (error) => error.message,
      })

      const result = await promise
      return result
    },
    []
  )

  return getMyLocation
}
