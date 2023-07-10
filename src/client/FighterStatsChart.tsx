import React from "react"
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"

interface Pokemon {
  name: string
  stats: {
    hp: number
    attack: number
    defense: number
    speed: number
    specialAttack: number
    specialDefense: number
  }
}

export const FighterStatsChart: React.FC<{ pokemon?: Pokemon }> = ({
  pokemon = {
    name: "Charizard",
    stats: {
      hp: 78,
      attack: 84,
      defense: 78,
      speed: 100,
      specialAttack: 109,
      specialDefense: 85,
    },
  },
}) => {
  const data = [
    {
      subject: "HP",
      A: pokemon.stats.hp,
    },
    {
      subject: "Attack",
      A: pokemon.stats.attack,
    },
    {
      subject: "Defense",
      A: pokemon.stats.defense,
    },
    {
      subject: "Speed",
      A: pokemon.stats.speed,
    },
    {
      subject: "Sp. Atk",
      A: pokemon.stats.specialAttack,
    },
    {
      subject: "Sp. Def",
      A: pokemon.stats.specialDefense,
    },
  ]
  const size = 450

  return (
    <RadarChart
      cx={size / 2}
      cy={size / 2}
      outerRadius={150}
      width={size}
      height={size}
      data={data}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <PolarRadiusAxis />
      <Radar
        name={pokemon.name}
        dataKey="A"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
    </RadarChart>
  )
}
