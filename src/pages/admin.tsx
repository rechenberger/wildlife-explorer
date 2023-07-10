import dynamic from "next/dynamic"
import { MainLayout } from "~/client/MainLayout"
import { cn } from "~/client/cn"
import { api } from "~/utils/api"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })

const MigrationButton = ({
  mutate,
  isLoading,
  label,
  data,
}: {
  mutate: () => void
  isLoading: boolean
  label: string
  data: any
}) => {
  return (
    <>
      <div className="flex flex-row gap-4">
        <button
          className={cn(["rounded border p-2", isLoading && "opacity-50"])}
          disabled={isLoading}
          onClick={() => mutate()}
        >
          Migrate {label}
        </button>
      </div>
      {!!data && (
        <div className="rounded border bg-white p-2">
          <JsonViewer value={data} collapsed={10} />
        </div>
      )}
    </>
  )
}

export default function Page() {
  const taxons = api.migration.taxons.useMutation()
  const battleOrder = api.migration.battleOrder.useMutation()
  const taxonDev = api.taxon.dev.useMutation()
  return (
    <MainLayout>
      <div className="max-h-[calc(100svh-500px)] w-full max-w-6xl overflow-scroll">
        <div className="w-full max-w-md"></div>
        <MigrationButton {...taxons} label="Taxons" />
        <MigrationButton {...battleOrder} label="battleOrder" />
        <MigrationButton {...taxonDev} label="taxonDev" />
      </div>
    </MainLayout>
  )
}
