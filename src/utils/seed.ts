import { isArray } from "lodash-es"
import seedrandom from "seedrandom"

export const createSeed = ({
  observationId,
  respawnsAt,
}: {
  observationId: number
  respawnsAt: Date
}) => {
  return `${observationId}-${respawnsAt.toISOString()}`
}

type RngSeed = string | (string | number)[]

export const rng = ({ seed }: { seed: RngSeed }) => {
  const seedString = isArray(seed) ? seed.join("~") : seed
  const generator = seedrandom(seedString)
  return generator()
}

export const rngInt = ({
  seed,
  min = 0,
  max,
}: {
  seed: RngSeed
  min?: number
  max: number
}) => {
  const rnd = rng({ seed })
  return Math.floor(rnd * (max - min + 1)) + min
}

export const rngItem = <T>({
  seed,
  items,
}: {
  seed: RngSeed
  items: T[]
}): T => {
  const idx = rngInt({ seed, max: items.length - 1 })
  return items[idx]!
}
