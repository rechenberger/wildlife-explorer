import dynamic from "next/dynamic"
import { type RouterOutputs } from "~/utils/api"

const JsonViewer = dynamic(() => import("../client/JsonViewer"), { ssr: false })

export type ExpReports = NonNullable<
  RouterOutputs["battle"]["makeChoice"]
>["expReports"]

export const ExpReportsView = ({ expReports }: { expReports: ExpReports }) => {
  return (
    <>
      <JsonViewer value={expReports} />
    </>
  )
}
