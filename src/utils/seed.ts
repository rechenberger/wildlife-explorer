export const createSeed = ({
  observationId,
  respawnsAt,
}: {
  observationId: number
  respawnsAt: Date
}) => {
  return `${observationId}-${respawnsAt.toISOString()}`
}
