import { Carter_One } from "next/font/google"
import { BrushStrokeBackground } from "./BrushStrokeBackground"

const carterOne = Carter_One({
  weight: "400",
  subsets: ["latin"],
})

export const MainTopNav = () => {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-10 flex flex-row px-4 py-8">
        <div className="flex-1"></div>
        <BrushStrokeBackground>
          <h1 className="text-6xl text-amber-400 [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
            <span className={carterOne.className}>Wildlife Explorer</span>
          </h1>
        </BrushStrokeBackground>
        <div className="flex-1"></div>
      </div>
    </>
  )
}
