"use client"

import { map } from "lodash-es"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { FighterChip } from "./FighterChip"
import { cn } from "./cn"
import { Button } from "./shadcn/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./shadcn/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/ui/popover"
import { useMyCatches } from "./useCatches"

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

export const MyCatchSelect = () => {
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string | null>()

  const { myCatches } = useMyCatches()

  const selectedCatch = myCatches?.find((c) => c.id === selectedId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between h-auto"
        >
          {selectedCatch ? (
            <FighterChip fighter={selectedCatch} showAbsoluteHp />
          ) : (
            "Select Catch..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command className="">
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No catch found.</CommandEmpty>
          <CommandGroup className="flex flex-col overflow-auto h-96">
            {/* <ScrollArea className="flex flex-col overflow-auto h-96"> */}
            {map(myCatches, (c) => (
              <CommandItem
                key={c.id}
                onSelect={() => {
                  setSelectedId(c.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedId === c.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1">
                  <FighterChip fighter={c} showAbsoluteHp />
                </div>
              </CommandItem>
            ))}
            {/* </ScrollArea> */}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
