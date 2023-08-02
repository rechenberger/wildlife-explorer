import { useState } from "react"
import { cn } from "./cn"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./shadcn/ui/tooltip"
import { type TypeIcon } from "./typeIcons"

export const TypeBadge = ({
  title,
  icon,
  content,
  onClick,
  size = "small",
  className,
}: {
  title?: string
  icon: TypeIcon
  content: string
  onClick?: () => void
  size?: "small" | "big"
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  return (
    <TooltipProvider>
      <Tooltip open={!!title && open} onOpenChange={(open) => setOpen(open)}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1 rounded-md pr-2 text-xs",
              icon.bgHalf,
              !icon.icon && "pl-1",
              onClick && "cursor-pointer",
              "ring-inset",
              onClick && icon.ringFull,
              // size === "big" && "text-sm",
              className
            )}
            onClick={onClick}
            onTouchStart={() => setOpen(true)}
            onTouchEnd={() => setOpen(false)}
          >
            {icon.icon && (
              <div
                className={cn(
                  "rounded-md p-1",
                  icon.bgFull,
                  size === "big" && "p-1.5"
                )}
              >
                <icon.icon
                  className={cn("h-3 w-3", size === "big" && "h-4 w-4")}
                />
              </div>
            )}
            <div
              className={cn(
                "flex-1 whitespace-nowrap select-none",
                size === "big" && "text-center"
              )}
            >
              {content}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="min-w-min max-w-[120px] select-none">{title}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
