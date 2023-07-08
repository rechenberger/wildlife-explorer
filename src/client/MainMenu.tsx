import { Camera, HeartHandshake, Radar, Sword } from "lucide-react"

export const MainMenu = () => {
  return (
    <>
      <div className="flex flex-row gap-2">
        <div className="">
          <Radar className="h-8 w-8" />
          <div>Find</div>
        </div>
        <div className="">
          <Camera className="h-8 w-8" />
          <div>Photograph</div>
        </div>
        <div className="">
          <HeartHandshake className="h-8 w-8" />
          <div>Catch</div>
        </div>
        <div className="">
          <Sword className="h-8 w-8" />
          <div>Battle</div>
        </div>
      </div>
    </>
  )
}
