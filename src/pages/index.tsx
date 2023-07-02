import { useRouter } from "next/router"
import { useEffect } from "react"
import { MainLayout } from "~/client/MainLayout"
import { MapBase } from "~/client/MapBase"
import { PlayerSelection } from "~/client/PlayerSelection"
import { usePlayer } from "~/client/usePlayer"

export default function Page() {
  const { player } = usePlayer()
  const router = useRouter()
  useEffect(() => {
    if (player) {
      // router.push(`/play/${player.id}`)
    }
  }, [player, router])
  return (
    <MainLayout>
      <MapBase isOverview></MapBase>
      <PlayerSelection />
    </MainLayout>
  )
}
