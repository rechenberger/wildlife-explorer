import NiceModal from "@ebay/nice-modal-react"
import { atom, useAtomValue, useSetAtom } from "jotai"
import { Check, Clock, ExternalLink, Frown, LocateOff, X } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import {
  ENABLE_BATTLE_VIEW,
  MIN_METER_ACCURACY_SHOW_INACCURATE,
  SHOW_OBSERVATION_JSON,
} from "~/config"
import { api } from "~/utils/api"
import { Away } from "./Away"
import { BattleViewModal } from "./BattleViewModal"
import { TimeAgo } from "./TimeAgo"
import { useWildlife } from "./WildlifeMarkers"
import { cn } from "./cn"
import { formatMeters } from "./formatMeters"
import { useCatch } from "./useCatch"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { navigatingToObservationIdAtom, useNavigation } from "./useNavigation"
import { usePlayer } from "./usePlayer"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })

export const currentObservationIdAtom = atom<number | null>(null)

export const CurrentObservation = () => {
  const { wildlife } = useWildlife()
  const currentObservationId = useAtomValue(currentObservationIdAtom)
  const setCurrentObservationId = useSetAtom(currentObservationIdAtom)

  const w = wildlife?.find((w) => w.observationId === currentObservationId)

  const navigatingToObservationId = useAtomValue(navigatingToObservationIdAtom)
  const { navigate } = useNavigation()

  const { playerId } = usePlayer()
  const trpc = api.useContext()
  const { doCatch, isLoading: catching } = useCatch()
  const { mutateAsync: attackWildlife, isLoading: attacking } =
    api.battle.attackWildlife.useMutation({
      onSuccess: (data) => {
        setCurrentObservationId(null)
        trpc.battle.invalidate()
        NiceModal.show(BattleViewModal, {
          battleId: data.id,
        })
      },
    })

  const getName = useGetWildlifeName()

  if (!w) return null

  const location = w.lat && w.lng ? { lat: w.lat, lng: w.lng } : null
  const onCooldown = w.respawnsAt > new Date()

  return (
    <>
      <div
        className="fixed inset-0 z-50 cursor-pointer bg-black/20 md:hidden"
        onClick={(e) => {
          e.stopPropagation()
          setCurrentObservationId(null)
        }}
      />
      <div
        className="fixed bottom-0 right-0 z-50 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-white p-4 text-black shadow md:bottom-8 md:right-8 md:rounded-xl"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
        }}
      >
        <div className="flex flex-row items-center gap-2">
          <div className="flex-1 truncate text-2xl">{getName(w)}</div>
          <button
            className="shrink-0"
            onClick={() => setCurrentObservationId(null)}
          >
            <X size={16} />
          </button>
        </div>
        <div className="-mt-4 text-xs italic opacity-60">
          Found by {w.foundBy.name} <TimeAgo date={w.createdAt} addSuffix />
        </div>
        <div className="-mt-2 flex flex-row flex-wrap justify-between gap-2">
          {location && <Away location={location} />}
          {w.metadata.observationCaptive && (
            <div className="flex flex-row items-center gap-1 text-sm font-bold text-red-500">
              <Frown size={16} className="inline-block" />
              <span>Captive</span>
            </div>
          )}
          {onCooldown && (
            <div className="flex flex-row items-center gap-1 text-sm font-bold text-gray-500">
              <Clock size={16} className="inline-block" />
              {/* <span>Respawn</span> */}
              <TimeAgo date={w.respawnsAt} addSuffix />
            </div>
          )}
          {!!w.caughtAt && (
            <div className="flex flex-row items-center gap-1 text-sm font-bold text-green-600">
              <Check size={16} className="inline-block" />
              {/* <span>Caught</span> */}
              <TimeAgo date={w.caughtAt} addSuffix />
            </div>
          )}
          {!!w.metadata.observationPositionalAccuracy &&
            w.metadata.observationPositionalAccuracy >
              MIN_METER_ACCURACY_SHOW_INACCURATE && (
              <div className="flex flex-row items-center gap-1 text-sm font-bold text-amber-500">
                <LocateOff size={16} className="inline-block" />
                {/* <span>Caught</span> */}
                <span>
                  {formatMeters(w.metadata.observationPositionalAccuracy)}
                </span>
              </div>
            )}
        </div>
        {w.metadata.observationImageUrlMedium ? (
          <div className="relative -mx-4 aspect-square">
            <Image
              src={w.metadata.observationImageUrlMedium}
              className="w-full object-cover object-center"
              alt={"Observation"}
              unoptimized
              fill={true}
            />
          </div>
        ) : w.metadata.taxonImageUrlMedium ? (
          <div className="relative -mx-4 aspect-square">
            <Image
              src={w.metadata.taxonImageUrlMedium}
              className="w-full object-cover object-center"
              alt={getName(w)}
              unoptimized
              fill={true}
            />
          </div>
        ) : null}
        {SHOW_OBSERVATION_JSON && (
          <div className="overflow-hidden text-[10px]">
            <JsonViewer value={w} theme="light" />
          </div>
        )}
        <div className="-my-2 flex flex-row flex-wrap items-center justify-center gap-2">
          {w.metadata.observationUrl && (
            <Link
              href={w.metadata.observationUrl}
              target="_blank"
              className="flex flex-row items-center gap-1 rounded px-1 py-0.5 hover:bg-black/10"
            >
              <ExternalLink size={12} />
              <div>iNaturalist</div>
            </Link>
          )}
          {w.metadata.taxonWikiUrl && (
            <Link
              href={w.metadata.taxonWikiUrl}
              target="_blank"
              className="flex flex-row items-center gap-1 rounded px-1 py-0.5 hover:bg-black/10"
            >
              <ExternalLink size={12} />
              <div>Wikipedia</div>
            </Link>
          )}
        </div>
        <div className="flex flex-row flex-wrap items-center justify-center gap-2">
          {location && (
            <button
              className={cn(
                "flex-1 rounded bg-black px-2 py-1 text-sm text-white",
                navigatingToObservationId === w.observationId &&
                  "cursor-progress bg-blue-500 opacity-50"
              )}
              onClick={() => {
                navigate({ ...location, observationId: w.observationId })
              }}
            >
              Visit
            </button>
          )}
          <button
            className={cn(
              "flex-1 rounded bg-black px-2 py-1 text-sm text-white",
              catching && "cursor-progress opacity-50"
            )}
            disabled={catching}
            onClick={async () => {
              doCatch({ wildlifeId: w.id })
            }}
          >
            Catch
          </button>
          {ENABLE_BATTLE_VIEW && (
            <button
              className={cn(
                "flex-1 rounded bg-black px-2 py-1 text-sm text-white",
                attacking && "cursor-progress opacity-50"
              )}
              disabled={catching}
              onClick={async () => {
                if (!playerId) return

                toast.promise(attackWildlife({ wildlifeId: w.id, playerId }), {
                  loading: "Starting Battle...",
                  success: "The Battle is on! 🔥",
                  error: (err) =>
                    err.message || "Failed to start battle. Try again.",
                })
              }}
            >
              Battle
            </button>
          )}
        </div>
      </div>
    </>
  )
}
