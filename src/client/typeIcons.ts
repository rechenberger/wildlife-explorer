import {
  Biohazard,
  Brain,
  Bug,
  Cat,
  Circle,
  Droplets,
  Dumbbell,
  Flame,
  Ghost,
  HelpCircle,
  Leaf,
  Moon,
  Mountain,
  Snowflake,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react"

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
    icon: Mountain,
    bgFull: "bg-gray-700 text-white",
    bgHalf: "bg-gray-700/50",
    ringFull: "ring-gray-700",
  },
  {
    name: "Grass",
    icon: Leaf,
    bgFull: "bg-green-400",
    bgHalf: "bg-green-400/50",
    ringFull: "ring-green-400",
  },
  {
    name: "Bug",
    icon: Bug,
    bgFull: "bg-lime-400",
    bgHalf: "bg-lime-400/50",
    ringFull: "ring-lime-400",
  },
  {
    name: "Ghost",
    icon: Ghost,
    bgFull: "bg-purple-400",
    bgHalf: "bg-purple-400/50",
    ringFull: "ring-purple-400",
  },
  {
    name: "Ice",
    icon: Snowflake,
    bgFull: "bg-lightblue-400",
    bgHalf: "bg-lightblue-400/50",
    ringFull: "ring-lightblue-400",
  },
  {
    name: "Poison",
    icon: Biohazard,
    bgFull: "bg-indigo-400",
    bgHalf: "bg-indigo-400/50",
    ringFull: "ring-indigo-400",
  },
  {
    name: "Psychic",
    icon: Brain,
    bgFull: "bg-pink-400",
    bgHalf: "bg-pink-400/50",
    ringFull: "ring-pink-400",
  },
  {
    name: "Dragon",
    icon: Cat,
    bgFull: "bg-purple-600",
    bgHalf: "bg-purple-600/50",
    ringFull: "ring-purple-600",
  },
  {
    name: "Dark",
    icon: Moon,
    bgFull: "bg-gray-800 text-white",
    bgHalf: "bg-gray-800/50",
    ringFull: "ring-gray-800",
  },
  {
    name: "Steel",
    icon: Dumbbell,
    bgFull: "bg-gray-500",
    bgHalf: "bg-gray-500/50",
    ringFull: "ring-gray-500",
  },
  {
    name: "Fairy",
    icon: Sparkles,
    bgFull: "bg-pink-200",
    bgHalf: "bg-pink-200/50",
    ringFull: "ring-pink-200",
  },
]

const fallbackTypeIcon = {
  name: "???",
  icon: HelpCircle,
  bgFull: "bg-black text-white",
  bgHalf: "bg-black/50",
  ringFull: "hover:ring ring-black",
}

export const getTypeIcon = (type: string) => {
  const typeIcon = typeIcons.find((typeIcon) => typeIcon.name === type)
  return typeIcon || { ...fallbackTypeIcon, name: type }
}
