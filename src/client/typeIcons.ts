import { Circle, Droplets, Flame, HelpCircle, Swords, Zap } from "lucide-react"

export const typeIcons = [
  {
    name: "Normal",
    icon: Circle,
    bgFull: "bg-gray-400",
    bgHalf: "bg-gray-400/50",
    ringFull: "ring-gray-400",
  },
  {
    name: "Electric",
    icon: Zap,
    bgFull: "bg-yellow-400",
    bgHalf: "bg-yellow-400/50",
    ringFull: "ring-yellow-400",
  },
  {
    name: "Water",
    icon: Droplets,
    bgFull: "bg-blue-400",
    bgHalf: "bg-blue-400/50",
    ringFull: "ring-blue-400",
  },
  {
    name: "Fire",
    icon: Flame,
    bgFull: "bg-red-400",
    bgHalf: "bg-red-400/50",
    ringFull: "ring-red-400",
  },
  {
    name: "Fighting",
    icon: Swords,
    bgFull: "bg-orange-400",
    bgHalf: "bg-orange-400/50",
    ringFull: "ring-orange-400",
  },
  {
    name: "Rock",
    icon: Flame,
    bgFull: "bg-gray-700 text-white",
    bgHalf: "bg-gray-700/50",
    ringFull: "ring-gray-700",
  },
]

const fallbackTypeIcon = {
  name: "???",
  icon: HelpCircle,
  bgFull: "bg-black",
  bgHalf: "bg-black/50",
  ringFull: "hover:ring ring-black",
}

export const getTypeIcon = (type: string) => {
  const typeIcon = typeIcons.find((typeIcon) => typeIcon.name === type)
  return typeIcon || { ...fallbackTypeIcon, name: type }
}
