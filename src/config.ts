export const DEV_MODE =
  process.env.NODE_ENV === "development" ||
  (typeof localStorage !== "undefined" && !!localStorage.getItem("DEV_MODE"))

export const GLOBAL_REALTIME_MULTIPLIER = DEV_MODE ? 1000 : 100
export const DEFAULT_LOCATION = {
  lat: 50.928435947011906,
  lng: 6.930087265110956,
}
export const MAX_NUMBER_SEE_WILDLIFE = 100
export const RADIUS_IN_KM_SEE_WILDLIFE = 5
export const RADIUS_IN_KM_SCAN_WILDLIFE_SMALL = 0.5
export const RADIUS_IN_KM_SCAN_WILDLIFE_BIG = 5
export const RADIUS_IN_KM_SCAN_PLACES = 5
export const RADIUS_IN_KM_SEE_PLACES = RADIUS_IN_KM_SCAN_PLACES
export const RADIUS_IN_M_CATCH_WILDLIFE = 500
export const RADIUS_IN_M_CARE_CENTER = 500

const DEV_RESPAWN = DEV_MODE ? 10 / 60 : undefined
export const RESPAWN_TIME_IN_MINUTES = {
  CATCH_SUCCESS: DEV_RESPAWN ?? 2,
  CATCH_FAIL: DEV_RESPAWN ?? 2,
  FAINTED: DEV_RESPAWN ?? 2,
  PLAYER_RUN: DEV_RESPAWN ?? 10,
  BATTLE_WON: DEV_RESPAWN ?? 10,
}

export const WILDLIFE_REFETCH_INTERVAL_IN_MS = 3_000
export const OTHER_PLAYER_REFETCH_INTERVAL_IN_MS = 1_000
export const SHOW_OBSERVATION_JSON =
  false && process.env.NODE_ENV === "development"
export const SCAN_COOLDOWN_IN_SECONDS = DEV_MODE ? 1 : 20
export const DEFAULT_DB_CHUNK_SIZE = 20
export const MAX_METER_BY_FOOT = 2_000
export const MAX_METER_BY_BICYCLE = 10_000
export const MIN_METER_ACCURACY_SHOW_INACCURATE = 200
export const MAX_FIGHTERS_PER_TEAM = 6
export const MAX_MOVES_PER_FIGHTER = 4

export const USE_LATEST_GEN = true

export const ENABLE_BATTLE_VIEW = true

export const CATCH_RATE_ALWAYS_WIN = 0.2
export const CATCH_RATE_ALWAYS_LOOSE = 0.2
export const CATCH_RATE_FIRST_FIGHTER = 1.0

export const BATTLE_REPORT_VERSION = 3
export const BATTLE_INPUT_VERSION = 3

export const SHOW_FUTURE_MOVES = true
export const CAN_RESET_MOVES = false

export const LOG_SCAN_TIME = true
export const SHOW_EXACT_IVS = DEV_MODE

export const MAX_EV_SINGLE_STAT = 252
export const MAX_EV_TOTAL = 510

export const SHORTCUTS = {
  SCAN: { code: "KeyS" },
  MY_CATCHES: { code: "KeyM" },
  CARE: { code: "KeyC" },
  BATTLE: { code: "KeyB" },
  MOVE_1: { code: "Digit1" },
  MOVE_2: { code: "Digit2" },
  MOVE_3: { code: "Digit3" },
  MOVE_4: { code: "Digit4" },
  SWITCH_1: { code: "Digit1", shift: true },
  SWITCH_2: { code: "Digit2", shift: true },
  SWITCH_3: { code: "Digit3", shift: true },
  SWITCH_4: { code: "Digit4", shift: true },
  SWITCH_5: { code: "Digit5", shift: true },
  SWITCH_6: { code: "Digit6", shift: true },
}
