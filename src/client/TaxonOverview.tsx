import { useState } from "react"

export const TaxonOverview = ({
  taxonId: initialTaxonId,
}: {
  taxonId: number
}) => {
  const [taxonId, setTaxonId] = useState(initialTaxonId)
  return (
    <>
      <div className="flex flex-col">
        <div className="">Taxon Overview</div>
      </div>
    </>
  )
}
