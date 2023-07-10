import { type ReactNode } from "react"

export const DividerHeading = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-row gap-2 items-center text-xs font-bold opacity-60 mt-4">
      <hr className="flex-1 border-black/60" />
      <div>{children}</div>
      <hr className="flex-1 border-black/60" />
    </div>
  )
}
