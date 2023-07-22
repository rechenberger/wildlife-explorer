import { atom, useAtom, useSetAtom } from "jotai"
import { ArrowRight } from "lucide-react"
import { Fragment, useEffect } from "react"
import { api, type RouterOutputs } from "~/utils/api"
import { DividerHeading } from "./DividerHeading"
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
            <DividerHeading>{data?.ancestors.length} ancestors</DividerHeading>
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
        className="flex flex-row gap-2 text-xs bg-gray-100 py-1 px-2"
        onClick={() => {
          setTaxonId(taxon.id)
        }}
      >
        <div className="flex flex-col flex-1">
          <div>{getName(taxon)}</div>
          <div>{taxon._count.wildlife}</div>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRight className="h-4 w-4" />
        </div>
        <div className="flex flex-col flex-1">
          <div>#{taxon.fighterSpeciesNum}</div>
          <div>{taxon.fighterSpeciesName}</div>
        </div>
      </div>
    </Fragment>
  )
}
