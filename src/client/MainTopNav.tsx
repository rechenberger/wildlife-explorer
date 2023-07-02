import { Carter_One } from "next/font/google"

const carterOne = Carter_One({
  weight: "400",
  subsets: ["latin"],
})

export const MainTopNav = () => {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-10 flex flex-row px-4 py-8 text-amber-400">
        <div className="flex-1"></div>
        <h1 className="text-6xl [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
          <span className={carterOne.className}>Wildlife Explorer</span>
        </h1>
        <div className="flex-1"></div>
      </div>
    </>
  )
}
