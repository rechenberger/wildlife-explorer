import { ScanButton } from "./ScanButton"

export const MainActionButtons = () => {
  return (
    <>
      <div className="absolute bottom-8 right-8 z-40 flex flex-row gap-2">
        <ScanButton />
      </div>
    </>
  )
}
