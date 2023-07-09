import NiceModal from "@ebay/nice-modal-react"
import "mapbox-gl/dist/mapbox-gl.css"
import { type Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { type AppType } from "next/app"
import { Toaster } from "sonner"
import "~/styles/globals.css"
import { api } from "~/utils/api"

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Toaster position="top-center" />
      <NiceModal.Provider>
        <Component {...pageProps} />
      </NiceModal.Provider>
    </SessionProvider>
  )
}

export default api.withTRPC(MyApp)
