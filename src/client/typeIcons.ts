import {
  Apple,
  ArrowRight,
  Biohazard,
  Bird,
  Brain,
  Bug,
  Cat,
  Circle,
  Droplets,
  Dumbbell,
  Flame,
  Gem,
  Ghost,
  HeartHandshake,
  HelpCircle,
  Leaf,
  Milestone,
  Moon,
  Mountain,
  Puzzle,
  Scale,
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
    icon: Gem,
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
  {
    name: "Ground",
    icon: Mountain,
    bgFull: "bg-amber-500",
    bgHalf: "bg-amber-500/50",
    ringFull: "ring-amber-500",
  },
  {
    name: "Flying",
    icon: Bird,
    bgFull: "bg-blue-200",
    bgHalf: "bg-blue-200/50",
    ringFull: "ring-blue-200",
  },
]

export const fallbackTypeIcon = {
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

export const abilityIcon = {
  name: "Ability",
  icon: Puzzle,
  bgFull: "bg-black/40 text-white",
  bgHalf: "bg-black/20",
  ringFull: "hover:ring ring-black",
}

export const natureIcon = {
  name: "Nature",
  icon: Scale,
  bgFull: "bg-black/40 text-white",
  bgHalf: "bg-black/20",
  ringFull: "hover:ring ring-black",
}

export const itemIcon = {
  name: "Item",
  icon: Apple,
  bgFull: "bg-black/40 text-white",
  bgHalf: "bg-black/20",
  ringFull: "hover:ring ring-black",
}

export const leaveIcon = {
  name: "Leave",
  icon: ArrowRight,
  bgFull: "bg-black/40 text-white",
  bgHalf: "bg-black/20",
  ringFull: "hover:ring ring-black",
}

export const catchIcon = {
  name: "Catch",
  icon: HeartHandshake,
  bgFull: "bg-black/40 text-white",
  bgHalf: "bg-black/20",
  ringFull: "hover:ring ring-black",
}

export const runIcon = {
  name: "Run",
  icon: Milestone,
  bgFull: "bg-black/40 text-white",
  bgHalf: "bg-black/20",
  ringFull: "hover:ring ring-black",
}

export type TypeIcon = {
  name: string
  icon?: any
  bgFull: string
  bgHalf: string
  ringFull: string
}
