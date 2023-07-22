import { atom, useAtom, useSetAtom } from "jotai"
import { padStart } from "lodash-es"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Fragment, useEffect } from "react"
import { api, type RouterOutputs } from "~/utils/api"
import { DividerHeading } from "./DividerHeading"
import { cn } from "./cn"
import { useGetWildlifeName } from "./useGetWildlifeName"
import { usePlayer } from "./usePlayer"

type Taxon = RouterOutputs["taxon"]["getTree"]["ancestors"][number]

const currentTaxonIdAtom = atom<number>(1)

export const TaxonOverview = ({
  taxonId: initialTaxonId,
}: {
  taxonId: number
}) => {
  const [taxonId, setTaxonId] = useAtom(currentTaxonIdAtom)
  useEffect(() => {
    setTaxonId(initialTaxonId)
  }, [initialTaxonId, setTaxonId])

  const { playerId } = usePlayer()
  const { data } = api.taxon.getTree.useQuery(
    {
      taxonId,
      playerId: playerId!,
    },
    {
      enabled: !!playerId && !!taxonId,
    }
  )
  const { data: globalExplorationProgress } =
    api.taxon.globalExplorationProgress.useQuery(
      {
        playerId: playerId!,
      },
      {
        enabled: !!playerId,
      }
    )
  if (!data) return null
  return (
    <>
      <div className="flex flex-col gap-2 overflow-hidden">
        {!!globalExplorationProgress && (
          <>
            <div className="text-center font-bold text-xs">
              {globalExplorationProgress.taxonCount.toLocaleString()} of{" "}
              {globalExplorationProgress.taxonCountMax.toLocaleString()} (
              {Math.floor(
                (100 * globalExplorationProgress.taxonCount) /
                  globalExplorationProgress.taxonCountMax
              )}
              %) Species found
            </div>
            <div className="text-center font-bold text-xs">
              {globalExplorationProgress.wildlifeCount.toLocaleString()} of{" "}
              {globalExplorationProgress.wildlifeCountMax.toLocaleString()} (
              {(
                (100 * globalExplorationProgress.wildlifeCount) /
                globalExplorationProgress.wildlifeCountMax
              ).toFixed(2)}
              %) Observations found
            </div>
          </>
        )}
        {!!data?.ancestors.length && (
          <>
            <DividerHeading>{data?.ancestors.length} Ancestors</DividerHeading>
            {data?.ancestors.map((taxon) => (
              <Fragment key={taxon.id}>
                <TaxonView taxon={taxon} />
              </Fragment>
            ))}
          </>
        )}
        <>
          <DividerHeading>Current Taxon</DividerHeading>
          <Fragment>
            <TaxonView taxon={data?.taxon} />
          </Fragment>
        </>
        {!!data?.taxon.descendants.length && (
          <>
            <DividerHeading>
              {data?.taxon.descendants.length} Descendants
            </DividerHeading>
            {data?.taxon.descendants.map((taxon) => (
              <Fragment key={taxon.id}>
                <TaxonView taxon={taxon} />
              </Fragment>
            ))}
          </>
        )}
      </div>
    </>
  )
}

const TaxonView = ({ taxon }: { taxon: Taxon }) => {
  const getName = useGetWildlifeName()
  const setTaxonId = useSetAtom(currentTaxonIdAtom)
  const numPadded = padStart(taxon.fighterSpeciesNum.toString(), 4).replaceAll(
    " ",
    "0"
  )
  const fighterImgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${taxon.fighterSpeciesNum}.png`
  return (
    <Fragment>
      <div
        className="flex flex-row gap-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 items-center"
        onClick={() => {
          setTaxonId(taxon.id)
        }}
      >
        {taxon.metadata.taxonImageUrlSquare && (
          <div className="relative aspect-square h-full rounded-full overflow-hidden shrink-0">
            <Image
              src={taxon.metadata.taxonImageUrlSquare}
              alt={"Taxon Image"}
              unoptimized
              fill={true}
            />
          </div>
        )}
        <div className="flex flex-col flex-1 py-1 px-2 overflow-hidden">
          <div className="text-sm font-bold truncate">{getName(taxon)}</div>
          <Link
            href={`https://www.inaturalist.org/taxa/${taxon.id}`}
            target="_blank"
            className="text-xs opacity-60 truncate hover:underline"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {taxon.metadata.taxonObservationsCount.toLocaleString()}{" "}
            Observations
          </Link>
        </div>
        <div className="flex flex-row gap-2 items-center justify-center">
          <ArrowRight
            className={cn(
              "h-4 w-4",
              taxon.isAnchor ? "text-green-500" : "text-gray-500"
            )}
          />
          {/* <Anchor className={cn("h-4 w-4", !taxon.isAnchor && "opacity-0")} /> */}
        </div>
        <Link
          href={`https://bulbapedia.bulbagarden.net/wiki/${taxon.fighterSpeciesName}_(Pok%C3%A9mon)`}
          target="_blank"
          className="flex flex-row gap-1 flex-1 py-1 px-2 hover:underline text-sm overflow-hidden"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="font-mono opacity-60">#{numPadded}</div>
          <div className="truncate">{taxon.fighterSpeciesName}</div>
        </Link>
        <div className="relative aspect-square h-full rounded-full overflow-hide shrink-0">
          <Image
            src={fighterImgUrl}
            alt={"Fighter Image"}
            unoptimized
            fill={true}
          />
        </div>
      </div>
    </Fragment>
  )
}