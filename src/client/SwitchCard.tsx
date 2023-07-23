import * as SwitchPrimitives from "@radix-ui/react-switch"
import React, { type ReactNode } from "react"
import { cn } from "./cn"
import { Label } from "./shadcn/ui/label"
import { Switch } from "./shadcn/ui/switch"

type Props = {
  titleElement: ReactNode
  description?: ReactNode
}

const SwitchCard = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & Props
>(({ className, titleElement, description, ...props }, ref) => (
  <div
    className={cn(
      "flex flex-row items-center justify-between rounded-md border bg-gray-50 border-gray-200 p-2 gap-4",
      className
    )}
  >
    <div className="space-y-0.5">
      <Label htmlFor={props.id}>{titleElement}</Label>
      <div className={cn("text-sm text-slate-500 dark:text-slate-400")}>
        {description}
      </div>
    </div>
    <Switch {...props} ref={ref} />
  </div>
))
SwitchCard.displayName = SwitchPrimitives.Root.displayName

export { SwitchCard }
