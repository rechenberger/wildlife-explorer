import dynamic from "next/dynamic"
import Head from "next/head"
import { api } from "~/utils/api"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" })

  return (
    <>
      <Head>
        <title>Poke</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Poke
          </h1>
          <div className="flex flex-col items-center gap-2">
            <JsonViewer value={hello.data} />
            {/* <pre className="text-sm text-white">
              {JSON.stringify(hello.data, null, 2)}
            </pre> */}
          </div>
        </div>
      </main>
    </>
  )
}
