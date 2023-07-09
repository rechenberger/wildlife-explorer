export const GLOBAL_REALTIME_MULTIPLIER = 20
export const DEFAULT_LOCATION = {
  lat: 50.928435947011906,
  lng: 6.930087265110956,
}
export const RADIUS_IN_KM_SEE_WILDLIFE = 1
export const RADIUS_IN_KM_SCAN_WILDLIFE_SMALL = 0.5
export const RADIUS_IN_KM_SCAN_WILDLIFE_BIG = 5
export const RADIUS_IN_M_CATCH_WILDLIFE = 50
export const DEFAULT_CATCH_SUCCESS_RATE = 0.5
export const DEFAULT_RESPAWN_TIME_IN_MINUTES = 10
export const WILDLIFE_REFETCH_INTERVAL_IN_MS = 3_000
export const OTHER_PLAYER_REFETCH_INTERVAL_IN_MS = 1_000
export const SHOW_OBSERVATION_JSON =
  false && process.env.NODE_ENV === "development"
export const SCAN_COOLDOWN_IN_SECONDS = 20
export const DEFAULT_DB_CHUNK_SIZE = 20
export const MAX_METER_BY_FOOT = 2_000
export const MAX_METER_BY_BICYCLE = 10_000
export const MIN_METER_ACCURACY_SHOW_INACCURATE = 200
export const MAX_FIGHTERS_PER_TEAM = 6
export const MAX_MOVES_PER_FIGHTER = 4
export const DEV_MODE =
  process.env.NODE_ENV === "development" ||
  (typeof localStorage !== "undefined" && !!localStorage.getItem("DEV_MODE"))

export const ENABLE_BATTLE_VIEW = false
