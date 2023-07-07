import { Circle, Droplets, Flame, HelpCircle, Zap } from "lucide-react"

export const typeIcons = [
  {
    name: "Normal",
    icon: Circle,
    bgFull: "bg-gray-400",
    bgHalf: "bg-gray-400/50",
  },
  {
    name: "Electric",
    icon: Zap,
    bgFull: "bg-yellow-400",
    bgHalf: "bg-yellow-400/50",
  },
  {
    name: "Water",
    icon: Droplets,
    bgFull: "bg-blue-400",
    bgHalf: "bg-blue-400/50",
  },
  {
    name: "Fire",
    icon: Flame,
    bgFull: "bg-red-400",
    bgHalf: "bg-red-400/50",
  },
]

const fallbackTypeIcon = {
  name: "???",
  icon: HelpCircle,
  bgFull: "bg-black",
  bgHalf: "bg-black/50",
}

export const getTypeIcon = (type: string) => {
  const typeIcon = typeIcons.find((typeIcon) => typeIcon.name === type)
  return typeIcon || { ...fallbackTypeIcon, name: type }
}
