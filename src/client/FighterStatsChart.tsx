import React from "react"
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"
import { type FighterForChip } from "./FighterChip"

export const FighterStatsChart: React.FC<{ fighter: FighterForChip }> = ({
  fighter,
}) => {
  const data = [
    {
      subject: "HP",
      A: fighter.fighter.stats.hp,
    },
    {
      subject: "Attack",
      A: fighter.fighter.stats.atk,
    },
    {
      subject: "Defense",
      A: fighter.fighter.stats.def,
    },
    {
      subject: "Speed",
      A: fighter.fighter.stats.spe,
    },
    {
      subject: "Sp. Atk",
      A: fighter.fighter.stats.spa,
    },
    {
      subject: "Sp. Def",
      A: fighter.fighter.stats.spd,
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
        name={"Stats"}
        dataKey="A"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
    </RadarChart>
  )
}
