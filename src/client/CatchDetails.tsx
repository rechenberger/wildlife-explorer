import { useSetAtom } from "jotai"
import { Edit2 } from "lucide-react"
import dynamic from "next/dynamic"
import { DEV_MODE } from "~/config"
import { getExpRate } from "~/data/pokemonLevelExperienceMap"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { currentObservationIdAtom } from "./CurrentObservation"
import { DividerHeading } from "./DividerHeading"
import { FighterChip } from "./FighterChip"
import { FighterMoves } from "./FighterMoves"
import { FighterStatsChart } from "./FighterStatsChart"
import { FighterTypeBadges } from "./FighterTypeBadges"
import { TimeAgo } from "./TimeAgo"
import { Progress } from "./shadcn/ui/progress"
import { useMyCatch } from "./useCatches"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { useMapSetCenter } from "./useMapRef"
import { usePlayer } from "./usePlayer"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })

export const CatchDetails = ({
  catchId,
  tiny,
}: {
  catchId: string
  tiny?: boolean
}) => {
  const { myCatch: c } = useMyCatch({ catchId })

  const getName = useGetWildlifeName()

  const mapSetCenter = useMapSetCenter()
  const setCurrentObservationId = useSetAtom(currentObservationIdAtom)

  const { playerId } = usePlayer()
  const trpc = api.useContext()
  const { mutate: rename } = api.catch.rename.useMutation({
    onSuccess: () => {
      trpc.catch.invalidate()
    },
  })

  if (!c)
    return (
      <div className="flex items-center justify-center py-12 text-center text-sm opacity-60">
        Loading...
      </div>
    )

  const currentXp = c.metadata.exp ?? 0
  const levelStartingXp = getExpRate(c.metadata)?.requiredExperience ?? 1
  const requiredXp =
    getExpRate({ ...c.metadata, level: (c.metadata.level ?? 0) + 1 })
      ?.requiredExperience ?? 1

  const percentXp = Math.floor(
    ((currentXp - levelStartingXp) / (requiredXp - levelStartingXp)) * 100
  )

  return (
    <>
      {!tiny && (
        <div className="flex flex-row gap-2">
          <div>{c.name || getName(c.wildlife)}</div>
          <button
            onClick={() => {
              const name = prompt("New Name", c.name || getName(c.wildlife))
              if (!playerId) return
              if (name) {
                rename({
                  catchId: c.id,
                  name,
                  playerId,
                })
              }
            }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="p-2 flex flex-col gap-4">
        {!tiny && (
          <>
            <DividerHeading>Wildlife</DividerHeading>
            <div className="flex flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-[50%]">
                <FighterChip showAbsoluteHp ltr fighter={c} />
              </div>
              <button
                className="text-right text-xs font-normal text-black opacity-60 inline-block"
                onClick={() => {
                  setCurrentObservationId(c.wildlife.observationId)
                  mapSetCenter(c.wildlife)
                }}
              >
                <div>
                  <span>Caught&nbsp;</span>
                  <Away
                    location={c.wildlife}
                    className="text-xs font-normal text-black inline-block"
                  />
                </div>
                <div className="">
                  <TimeAgo date={c.createdAt} addSuffix={true} />
                </div>
              </button>
            </div>
          </>
        )}

        {!tiny && <DividerHeading>Types, Ability, Nature</DividerHeading>}
        <div className="flex flex-row gap-2 flex-wrap">
          <FighterTypeBadges
            fighter={c}
            showTypes
            showAbility={!tiny}
            showNature={!tiny}
            size={"big"}
            className="flex-1"
          />
        </div>

        {!tiny && <DividerHeading>Moves</DividerHeading>}
        <FighterMoves fighter={c} />

        {!tiny && (
          <>
            <DividerHeading>Experience</DividerHeading>
            <div className="flex flex-1 items-center text-xs justify-center">
              {currentXp} / {requiredXp}
            </div>
            <Progress className="w-full" value={percentXp} />
          </>
        )}
        {!tiny && (
          <>
            <DividerHeading>Stats</DividerHeading>
            <FighterStatsChart fighter={c} />
          </>
        )}
        {!tiny && DEV_MODE && (
          <>
            <DividerHeading>JSON</DividerHeading>
            <JsonViewer value={c} collapsed />
          </>
        )}
      </div>
    </>
  )
}
