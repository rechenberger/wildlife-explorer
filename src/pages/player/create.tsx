import { useRouter } from "next/router"
import { z } from "zod"
import { MainLayout } from "~/client/MainLayout"
import { DEFAULT_LOCATION } from "~/config"
import { api } from "~/utils/api"

export default function Page() {
  const router = useRouter()
  const { mutate } = api.player.createMe.useMutation({
    onSuccess: (player) => {
      router.push(`/play/${player.id}`)
    },
  })

  return (
    <MainLayout>
      <div className="container flex flex-1 flex-col items-center justify-center">
        <form
          className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white/20 p-4"
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const data = Object.fromEntries(formData.entries())
            const schema = z.object({
              name: z.string().min(1),
            })
            const parsed = schema.parse(data)

            mutate({
              ...parsed,
              lat: DEFAULT_LOCATION.lat,
              lng: DEFAULT_LOCATION.lng,
            })
          }}
        >
          <div className="text-2xl">Create Player</div>
          <label className="flex flex-col">
            <div>Name</div>
            <input
              type="text"
              name="name"
              className="rounded border bg-transparent px-2 py-1"
            />
          </label>
          <button className="rounded bg-black px-2 py-1">Create</button>
        </form>
      </div>
    </MainLayout>
  )
}
