import { cn } from "./cn"
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
  return (
    <>
      <div
        title={title || content}
        className={cn(
          "flex items-center gap-1 rounded-md pr-2 text-xs",
          icon.bgHalf,
          !icon.icon && "pl-1",
          onClick && "cursor-pointer",
          // size === "big" && "text-sm",
          className
        )}
        onClick={onClick}
      >
        {icon.icon && (
          <div
            className={cn(
              "rounded-md p-1",
              icon.bgFull,
              size === "big" && "p-1.5"
            )}
          >
            <icon.icon className={cn("h-3 w-3", size === "big" && "h-4 w-4")} />
          </div>
        )}
        <div className={cn("flex-1", size === "big" && "text-center")}>
          {content}
        </div>
      </div>
    </>
  )
}
