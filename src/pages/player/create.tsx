import { MainLayout } from "~/client/MainLayout"

export default function Page() {
  return (
    <MainLayout>
      <div className="container flex flex-1 flex-col items-center justify-center">
        <form className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white/20 p-4">
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
