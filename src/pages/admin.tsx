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
        <div className="rounded border p-2">
          <JsonViewer value={data} />
        </div>
      )}
    </>
  )
}

export default function Page() {
  const taxons = api.migration.taxons.useMutation()
  return (
    <MainLayout>
      <div className="w-full max-w-md"></div>
      <MigrationButton {...taxons} label="Taxons" />
    </MainLayout>
  )
}
