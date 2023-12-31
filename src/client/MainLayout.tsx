import Head from "next/head"
import { type ReactNode } from "react"
import { MainTopNav } from "./MainTopNav"

export const MainLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Head>
        <title>Wildlife Explorer</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#72A5A6"></meta>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, viewport-fit=cover"
        />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <script
          defer
          src="https://teampilot.ai/widget.js"
          data-launchpad-slug-id="wilma-73d033dca3da17a8da85fbfd97aa1fea"
          data-hide-bubble
        />
      </Head>
      <main className="relative flex h-[100svh] w-full flex-col items-center justify-center bg-gradient-to-br  from-cyan-500 to-amber-600 text-white">
        <MainTopNav />
        {children}
      </main>
    </>
  )
}
