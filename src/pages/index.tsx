import { MainLayout } from "~/client/MainLayout"
import { MapBase } from "~/client/MapBase"
import { usePlayer } from "~/client/usePlayer"

export default function Page() {
  usePlayer()
  return (
    <MainLayout>
      <MapBase></MapBase>
    </MainLayout>
  )
}
