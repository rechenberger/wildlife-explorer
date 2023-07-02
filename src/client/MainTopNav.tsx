import { Carter_One } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import logo from "../../public/favicon.png"
import { BrushStrokeBackground } from "./BrushStrokeBackground"

const carterOne = Carter_One({
  weight: "400",
  subsets: ["latin"],
})

export const MainTopNav = () => {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-10 flex flex-row px-2 pt-4 md:px-4 md:pt-8">
        <div className="flex flex-1 flex-row items-center justify-start"></div>
        <BrushStrokeBackground>
          <Link
            href="/"
            className="-mx-8 -my-2 flex flex-row items-center gap-2 text-2xl text-amber-400 [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)] md:-mx-8 md:my-0 md:text-6xl"
          >
            <Image
              src={logo}
              alt="Wildlife Explorer Logo"
              className="aspect-square h-10 w-10 rounded-full md:h-20 md:w-20"
            />
            <span className={carterOne.className}>Wildlife Explorer</span>
          </Link>
        </BrushStrokeBackground>
        <div className="flex flex-1 flex-row items-center justify-end">
          {/* <LoginButton /> */}
        </div>
      </div>
    </>
  )
}
