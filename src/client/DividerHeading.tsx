import { type ReactNode } from "react"
import { cn } from "./cn"

export const DividerHeading = ({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center text-xs font-bold opacity-60 mt-4",
        className
      )}
    >
      <hr className="flex-1 border-black/60" />
      <div>{children}</div>
      <hr className="flex-1 border-black/60" />
    </div>
  )
}
