import { Swords } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { api } from "~/utils/api"
import { useLatestBattleParticipation } from "./BattleViewButton"
import { useCare } from "./CareButton"
import { Button } from "./shadcn/ui/button"
import { Input } from "./shadcn/ui/input"
import { Label } from "./shadcn/ui/label"
import { useAttackWildlife } from "./useAttackWildlife"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { useKeyboardShortcut } from "./useKeyboardShortcut"
import { useMakeChoice } from "./useMakeChoice"
import { usePlayer } from "./usePlayer"
import { useWildlifeToBattle } from "./useWildlife"

const useAutoBattle = () => {
  const [minLevel, setMinLevel] = useState(10)
  const [maxLevel, setMaxLevel] = useState(20)
  const [maxIvScore, setMaxIvScore] = useState(74)

  const [active, setActive] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const log = useCallback((msg: string) => {
    setLogs((logs) => [...logs, msg])
  }, [])

  const { mutateAsync: makeChoice } = useMakeChoice()
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
  const { attackWildlife } = useAttackWildlife()

  const loadingRef = useRef(false)

  const getName = useGetWildlifeName()

  useKeyboardShortcut("CANCEL", () => {
    toast("Auto Battle Stopped")
    setActive(false)
  })

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
        }
        // TODO: accumulate xp reports
      } else {
        // Start Battle
        const w = wildlife.find((w) => {
          if (w.fighter.level < minLevel) return false
          if (w.fighter.level > maxLevel) return false
          if (
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
    doStuff().then(() => {
      loadingRef.current = false
    })
  }, [
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
  } = useAutoBattle()

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div>Auto Battle</div>
        <div className="flex flex-row gap-2">
          <Label>
            <span>Min Level</span>
            <Input
              type="number"
              value={minLevel}
              onChange={(e) => setMinLevel(parseInt(e.target.value))}
            />
          </Label>
          <Label>
            <span>Max Level</span>
            <Input
              type="number"
              value={maxLevel}
              onChange={(e) => setMaxLevel(parseInt(e.target.value))}
            />
          </Label>
          <Label>
            <span>Max IV Score</span>
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
        <div className="flex flex-col items-center gap-2 text-xs text-left">
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      </div>
    </>
  )
}