import { CatchDetails } from "./CatchDetails"
import { DividerHeading } from "./DividerHeading"

export const MoveSwapper = ({ catchId }: { catchId: string }) => {
  return (
    <>
      <div>Edit Moves</div>
      <CatchDetails catchId={catchId} showWildlife showDividers />
      <DividerHeading>Active Moves</DividerHeading>
      <div className=""></div>
      <DividerHeading>Learned Moves</DividerHeading>
      <div className=""></div>
      <DividerHeading>Future Moves</DividerHeading>
      <div className=""></div>
    </>
  )
}
