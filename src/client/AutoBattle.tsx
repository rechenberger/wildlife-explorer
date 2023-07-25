import { isNumber } from "@turf/turf"
import { atom, useAtom } from "jotai"
import { forEach, takeRight } from "lodash-es"
import { Swords } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { atomWithLocalStorage } from "~/utils/atomWithLocalStorage"
import { useLatestBattleParticipation } from "./BattleViewButton"
import { useCare } from "./CareButton"
import { ExpReportsView, type ExpReports } from "./ExpReportsView"
import { cn } from "./cn"
import { Button } from "./shadcn/ui/button"
import { Input } from "./shadcn/ui/input"
import { Label } from "./shadcn/ui/label"
import { useAttackWildlife } from "./useAttackWildlife"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { useKeyboardShortcut } from "./useKeyboardShortcut"
import { useMakeChoice } from "./useMakeChoice"
import { usePlayer } from "./usePlayer"
import { useWildlifeToBattle } from "./useWildlife"

const minLevelAtom = atomWithLocalStorage("autoBattleMinLevel", 10)
const maxLevelAtom = atomWithLocalStorage("autoBattleMaxLevel", 20)
const maxIvScoreAtom = atomWithLocalStorage("autoBattleMaxIvScore", 74)
const expReportsAtom = atom<ExpReports>([])
const logsAtom = atom<string[]>([])

const useAutoBattle = () => {
  const [active, setActive] = useState(false)

  const [minLevel, setMinLevel] = useAtom(minLevelAtom)
  const [maxLevel, setMaxLevel] = useAtom(maxLevelAtom)
  const [maxIvScore, setMaxIvScore] = useAtom(maxIvScoreAtom)
  const [expReports, setExpReports] = useAtom(expReportsAtom)
  const [logs, setLogs] = useAtom(logsAtom)

  const log = useCallback(
    (msg: string) => {
      setLogs((logs) => [...logs, msg])
    },
    [setLogs]
  )

  const { mutateAsync: makeChoice } = useMakeChoice({ skipExpReports: true })
  const { activeBattleId, refetchLatestBattleParticipation } =
    useLatestBattleParticipation()

  const { playerId } = usePlayer()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { refetch: fetchBattleStatus } = api.battle.getBattleStatus.useQuery(
    {
      battleId: activeBattleId!,
      playerId: playerId!,
    },
    {
      enabled: false,
    }
  )

  const wildlife = useWildlifeToBattle()
  const { care } = useCare()
  const { attackWildlife } = useAttackWildlife({ skipBattleView: true })

  const loadingRef = useRef(false)

  const getName = useGetWildlifeName()

  useKeyboardShortcut("CANCEL", () => {
    toast("Auto Battle Stopped")
    setActive(false)
  })

  const [counter, setCounter] = useState(0)

  useEffect(() => {
    if (loadingRef.current) return

    const doStuff = async () => {
      if (!active) return
      if (activeBattleId) {
        // Battle
        // const battleStatus = await fetchBattleStatus()
        // TODO: handle fainted
        // TODO: better choice?
        const choice = "move 1"
        const choiceResult = await makeChoice({
          battleId: activeBattleId,
          playerId: playerId!,
          choice,
        })
        log(`Choice: ${choice}`)

        if (choiceResult?.iAmWinner !== undefined) {
          log(`Battle ${choiceResult?.iAmWinner ? "won" : "lost"}`)
          await refetchLatestBattleParticipation()
        }
        if (choiceResult?.expReports) {
          setExpReports((prevReports) => {
            const newReports = choiceResult.expReports
            const reports = prevReports.map((o) => {
              const n = newReports.find(
                (r) =>
                  r.battleReportFighter.catch?.id ===
                  o.battleReportFighter.catch?.id
              )

              if (!n) return o

              return {
                ...o,
                levelGained: (o.levelGained || 0) + (n.levelGained || 0),
                expGained: (o.expGained || 0) + (n.expGained || 0),
                expPercentageAfter: {
                  expPercentage: Math.max(
                    o.expPercentageAfter?.expPercentage || 0,
                    n.expPercentageAfter?.expPercentage || 0
                  ),
                },
              } as any
            })
            forEach(newReports, (n) => {
              if (
                !reports.find(
                  (r) =>
                    r.battleReportFighter.catch?.id ===
                    n.battleReportFighter.catch?.id
                )
              ) {
                reports.push(n)
              }
            })

            return reports
          })
        }
        return true
        // TODO: accumulate xp reports
      } else {
        // Start Battle
        const w = wildlife.find((w) => {
          if (w.fighter.level < minLevel) return false
          if (w.fighter.level > maxLevel) return false
          if (
            maxIvScore &&
            isNumber(maxIvScore) &&
            typeof w.fighter.ivScore === "number" &&
            w.fighter.ivScore > maxIvScore
          ) {
            return false
          }

          if (w.wildlife.caughtAt) return false
          const respawning = w.wildlife.respawnsAt > new Date()
          if (respawning) return false

          return true
        })
        if (!w) {
          log("No wildlife to battle")
          setActive(false)
          return
        }
        await care()
        await attackWildlife({
          wildlifeId: w!.wildlife.id,
        })
        await refetchLatestBattleParticipation()
        log(`Start Battle with ${getName(w)} (Level ${w.fighter.level})`)
      }
    }

    loadingRef.current = true
    doStuff().then((r) => {
      if (r) {
        // counter re-triggers effect
        setCounter((c) => c + 1)
      }
      loadingRef.current = false
    })
  }, [
    counter,
    active,
    activeBattleId,
    attackWildlife,
    care,
    getName,
    log,
    makeChoice,
    maxIvScore,
    maxLevel,
    minLevel,
    playerId,
    refetchLatestBattleParticipation,
    wildlife,
    setExpReports,
  ])

  return {
    logs,
    active,
    setActive,
    minLevel,
    setMinLevel,
    maxLevel,
    setMaxLevel,
    maxIvScore,
    setMaxIvScore,
    expReports,
    setExpReports,
    setLogs,
  }
}

export const AutoBattle = () => {
  const {
    logs,
    active,
    setActive,
    minLevel,
    setMinLevel,
    maxLevel,
    setMaxLevel,
    maxIvScore,
    setMaxIvScore,
    expReports,
    setExpReports,
    setLogs,
  } = useAutoBattle()

  const [showCompleteBattleReport, setshowCompleteBattleReport] =
    useState(false)

  const logsShown = showCompleteBattleReport ? logs : takeRight(logs, 3)

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div>Auto Battle</div>
        <div className="flex flex-row gap-2">
          <Label>
            <div className="mb-1">Min Level</div>
            <Input
              type="number"
              value={minLevel}
              onChange={(e) => setMinLevel(parseInt(e.target.value))}
            />
          </Label>
          <Label>
            <div className="mb-1">Max Level</div>
            <Input
              type="number"
              value={maxLevel}
              onChange={(e) => setMaxLevel(parseInt(e.target.value))}
            />
          </Label>
          <Label>
            <div className="mb-1">Max IV Score</div>
            <Input
              type="number"
              value={maxIvScore}
              onChange={(e) => setMaxIvScore(parseInt(e.target.value))}
            />
          </Label>
        </div>
        <Button onClick={() => setActive(!active)}>
          <Swords className="w-4 h-4 mr-1" />
          {active ? "Stop" : "Start"}
        </Button>
        {/* {expReports && (
          <Button
            onClick={() => {
              NiceModal.show(ExpReportsModal, {
                expReports,
              })
            }}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Show Exp
          </Button>
        )} */}
        {expReports && (
          <div className="flex flex-col w-full">
            <ExpReportsView expReports={expReports} reportsOnly />
          </div>
        )}
        <div className="flex flex-col-reverse items-center gap-2 text-xs text-left">
          {logsShown.map((log, idx) => (
            <div
              key={idx}
              className={cn(
                idx === logsShown.length - 1 ? "font-bold" : "opacity-60"
              )}
            >
              {log}
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-2 w-full">
          <Button
            onClick={() => setshowCompleteBattleReport((s) => !s)}
            variant={"secondary"}
            className="flex-1"
          >
            {`${showCompleteBattleReport ? "Hide" : "Show"} All Logs`}
          </Button>
          <Button
            onClick={() => {
              setExpReports([])
              setLogs([])
            }}
            variant={"secondary"}
            className="flex-1"
          >
            Reset Exp Reports
          </Button>
        </div>
      </div>
    </>
  )
}
