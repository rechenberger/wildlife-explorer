import React from "react"
import {
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"
import { type BattleReportFighter } from "~/server/lib/battle/BattleReport"

export const FighterStatsChart: React.FC<{ fighter: BattleReportFighter }> = ({
  fighter,
}) => {
  const data = [
    {
      subject: "HP",
      A: fighter.fighter.stats.hp,
      B: fighter.fighter.ivLabels?.hp,
    },
    {
      subject: "Attack",
      A: fighter.fighter.stats.atk,
      B: fighter.fighter.ivLabels?.atk,
    },
    {
      subject: "Defense",
      A: fighter.fighter.stats.def,
      B: fighter.fighter.ivLabels?.def,
    },
    {
      subject: "Speed",
      A: fighter.fighter.stats.spe,
      B: fighter.fighter.ivLabels?.spe,
    },
    {
      subject: "Sp. Def",
      A: fighter.fighter.stats.spd,
      B: fighter.fighter.ivLabels?.spd,
    },
    {
      subject: "Sp. Atk",
      A: fighter.fighter.stats.spa,
      B: fighter.fighter.ivLabels?.spa,
    },
  ]
  const size = 400

  const CustomizedAxisTick = (props: any) => {
    let { x, y, payload, cx, cy } = props

    // move labels out
    const moveOutFactor = 1.22
    x = (x - cx) * moveOutFactor + cx
    y = (y - cy) * moveOutFactor + cy

    return (
      <g transform={`translate(${x},${y + 8})`}>
        <text fontSize={12} x={0} y={-20} textAnchor="middle" fill="#666">
          {data.find((d) => d.subject === payload.value)?.B}
        </text>
        <text
          x={0}
          y={0}
          // dy={30}
          textAnchor="middle"
          fill="#666"
          // transform="rotate(-35)"
        >
          {payload.value}
        </text>
        <text x={0} y={18} fontSize={12} textAnchor="middle" fill="#666">
          {data.find((d) => d.subject === payload.value)?.A}
        </text>
      </g>
    )
  }

  return (
    <div className="w-full aspect-square bg-gray-50 rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx={"50%"}
          cy={"50%"}
          outerRadius={"65%"}
          width={size}
          height={size}
          data={data}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={CustomizedAxisTick} />
          <PolarRadiusAxis />
          <Radar
            name={"Stats"}
            dataKey="A"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <LabelList dataKey="A" position="outside" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
