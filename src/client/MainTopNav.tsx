import { Carter_One } from "next/font/google"
import { BrushStrokeBackground } from "./BrushStrokeBackground"
import { LoginButton } from "./LoginButton"

const carterOne = Carter_One({
  weight: "400",
  subsets: ["latin"],
})

export const MainTopNav = () => {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-10 flex flex-row gap-2 p-2 md:px-4 md:py-8">
        <div className="hidden flex-1 flex-row items-center justify-start md:flex"></div>
        <BrushStrokeBackground>
          <h1 className="text-base text-amber-400 [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)] md:text-6xl">
            <span className={carterOne.className}>Wildlife Explorer</span>
          </h1>
        </BrushStrokeBackground>
        <div className="flex flex-1 flex-row items-center justify-end">
          <LoginButton />
        </div>
      </div>
    </>
  )
}
