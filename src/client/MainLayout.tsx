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
      </Head>
      <main className="relative flex h-[100svh] w-full flex-col items-center bg-gradient-to-br from-cyan-500  to-amber-600">
        <MainTopNav />
        {children}
      </main>
    </>
  )
}