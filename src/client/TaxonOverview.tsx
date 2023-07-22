import { atom, useAtom, useSetAtom } from "jotai"
import { padStart } from "lodash-es"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
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
      enabled: !!playerId,
    }
  )
  if (!data) return null
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="">Taxon Overview</div>
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
  return (
    <Fragment>
      <div
        className="flex flex-row gap-4 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 items-center"
        onClick={() => {
          setTaxonId(taxon.id)
        }}
      >
        {taxon.metadata.taxonImageUrlSquare && (
          <div className="relative aspect-square h-full rounded-full overflow-hidden">
            <Image
              src={taxon.metadata.taxonImageUrlSquare}
              alt={"Taxon Image"}
              unoptimized
              fill={true}
            />
          </div>
        )}
        <div className="flex flex-col flex-1 py-1 px-2">
          <div className="text-sm font-bold truncate">{getName(taxon)}</div>
          <div className="text-xs opacity-60 truncate">
            {taxon.metadata.taxonObservationsCount.toLocaleString()}{" "}
            Observations
          </div>
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
        <div className="flex flex-row gap-1 flex-1 py-1 px-2">
          <div className="font-mono opacity-60">
            #
            {padStart(taxon.fighterSpeciesNum.toString(), 3).replaceAll(
              " ",
              "0"
            )}
          </div>
          <div>{taxon.fighterSpeciesName}</div>
        </div>
      </div>
    </Fragment>
  )
}
