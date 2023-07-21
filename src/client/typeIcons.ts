import {
  Apple,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Award,
  Biohazard,
  Bird,
  Brain,
  Bug,
  Cat,
  Check,
  Circle,
  Clock,
  Droplets,
  Dumbbell,
  Edit2,
  Flame,
  Frown,
  Gem,
  Ghost,
  HeartHandshake,
  HeartPulse,
  HelpCircle,
  Leaf,
  Milestone,
  Moon,
  Mountain,
  Navigation,
  Puzzle,
  Scale,
  Snowflake,
  Sparkle,
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
    bgFull: "bg-cyan-300",
    bgHalf: "bg-cyan-300/50",
    ringFull: "ring-cyan-300",
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

const defaultIcon = {
  name: "",
  icon: ArrowLeft,
  bgFull: "bg-gray-500 text-white",
  bgHalf: "bg-gray-200",
  ringFull: "hover:ring ring-gray-500",
}

export const abilityIcon = {
  ...defaultIcon,
  name: "Ability",
  icon: Puzzle,
}

export const natureIcon = {
  ...defaultIcon,
  name: "Nature",
  icon: Scale,
}

export const itemIcon = {
  ...defaultIcon,
  name: "Item",
  icon: Apple,
}

export const leaveIcon = {
  ...defaultIcon,
  name: "Leave",
  icon: ArrowRight,
}

export const catchIcon = {
  ...defaultIcon,
  name: "Catch",
  icon: HeartHandshake,
}

export const careIcon = {
  name: "Care",
  icon: HeartPulse,
  bgFull: "bg-purple-500 text-white",
  bgHalf: "bg-purple-500/50",
  ringFull: "hover:ring ring-purple-500",
}

export const runIcon = {
  ...defaultIcon,
  name: "Run",
  icon: Milestone,
}

export const navigateIcon = {
  ...defaultIcon,
  name: "Navigate",
  icon: Navigation,
}

export const readyIcon = {
  name: "Ready",
  icon: Check,
  bgFull: "bg-green-500 text-white",
  bgHalf: "bg-green-500/50",
  ringFull: "hover:ring ring-green-500",
}

export const waitingIcon = {
  name: "Waiting",
  icon: Clock,
  bgFull: "bg-yellow-500 text-white",
  bgHalf: "bg-yellow-500/50",
  ringFull: "hover:ring ring-yellow-500",
}

export const winnerIcon = {
  name: "Winner",
  icon: Award,
  bgFull: "bg-green-500 text-white",
  bgHalf: "bg-green-500/50",
  ringFull: "hover:ring ring-green-500",
}

export const loserIcon = {
  name: "Loser",
  icon: Frown,
  bgFull: "bg-red-500 text-white",
  bgHalf: "bg-red-500/50",
  ringFull: "hover:ring ring-red-500",
}

export const editIcon = {
  ...defaultIcon,
  name: "Edit",
  icon: Edit2,
}

export const swapIcon = {
  ...defaultIcon,
  name: "Edit",
  icon: ArrowLeftRight,
}
export const evolveIcon = {
  bgHalf: "bg-yellow-500/50",
  bgFull: "bg-yellow-500",
  ringFull: "hover:ring ring-yellow-500",
  name: "Evolve",
  icon: Sparkle,
}

export type TypeIcon = {
  name: string
  icon?: any
  bgFull: string
  bgHalf: string
  ringFull: string
}
