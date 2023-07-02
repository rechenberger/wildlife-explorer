import dynamic from "next/dynamic"
import { MainLayout } from "~/client/MainLayout"
import { api } from "~/utils/api"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" })

  return (
    <MainLayout>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Wildlife
        </h1>
        <div className="flex flex-col items-center gap-2">
          <JsonViewer value={hello.data} />
        </div>
      </div>
    </MainLayout>
  )
}
