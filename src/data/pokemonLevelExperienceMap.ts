import { type CatchMetadata } from "~/server/schema/CatchMetadata"

export const getExpRate = ({
  level,
  levelingRate,
}: Pick<CatchMetadata, "levelingRate" | "level">) => {
  if (!levelingRate) return undefined
  if (!level) return undefined
  const key = `${level}-${levelingRate}`
  return pokemonExperienceMap[key]
}

export const getLevelFromExp = ({
  exp,
  levelingRate,
}: Pick<CatchMetadata, "levelingRate" | "exp">) => {
  if (!levelingRate) return undefined
  if (!exp) return undefined
  const currentLevelBasedOnExp =
    (Object.values(pokemonExperienceMap).find(
      (obj) =>
        obj.requiredExperience > (exp ?? 0) && obj.levelingRate === levelingRate
    )?.level || 1) - 1
  return currentLevelBasedOnExp
}

const pokemonExperienceMap: {
  [key: string]: {
    level: number
    levelingRate: string
    requiredExperience: number
  }
} = {
  "1-Erratic": {
    level: 1,
    levelingRate: "Erratic",
    requiredExperience: 1,
  },
  "1-Fast": {
    level: 1,
    levelingRate: "Fast",
    requiredExperience: 1,
  },
  "1-Medium Fast": {
    level: 1,
    levelingRate: "Medium Fast",
    requiredExperience: 1,
  },
  "1-Medium Slow": {
    level: 1,
    levelingRate: "Medium Slow",
    requiredExperience: 1,
  },
  "1-Slow": {
    level: 1,
    levelingRate: "Slow",
    requiredExperience: 1,
  },
  "1-Fluctuating": {
    level: 1,
    levelingRate: "Fluctuating",
    requiredExperience: 1,
  },
  "2-Erratic": {
    level: 2,
    levelingRate: "Erratic",
    requiredExperience: 15,
  },
  "2-Fast": {
    level: 2,
    levelingRate: "Fast",
    requiredExperience: 6,
  },
  "2-Medium Fast": {
    level: 2,
    levelingRate: "Medium Fast",
    requiredExperience: 8,
  },
  "2-Medium Slow": {
    level: 2,
    levelingRate: "Medium Slow",
    requiredExperience: 9,
  },
  "2-Slow": {
    level: 2,
    levelingRate: "Slow",
    requiredExperience: 10,
  },
  "2-Fluctuating": {
    level: 2,
    levelingRate: "Fluctuating",
    requiredExperience: 4,
  },
  "3-Erratic": {
    level: 3,
    levelingRate: "Erratic",
    requiredExperience: 52,
  },
  "3-Fast": {
    level: 3,
    levelingRate: "Fast",
    requiredExperience: 21,
  },
  "3-Medium Fast": {
    level: 3,
    levelingRate: "Medium Fast",
    requiredExperience: 27,
  },
  "3-Medium Slow": {
    level: 3,
    levelingRate: "Medium Slow",
    requiredExperience: 57,
  },
  "3-Slow": {
    level: 3,
    levelingRate: "Slow",
    requiredExperience: 33,
  },
  "3-Fluctuating": {
    level: 3,
    levelingRate: "Fluctuating",
    requiredExperience: 13,
  },
  "4-Erratic": {
    level: 4,
    levelingRate: "Erratic",
    requiredExperience: 122,
  },
  "4-Fast": {
    level: 4,
    levelingRate: "Fast",
    requiredExperience: 51,
  },
  "4-Medium Fast": {
    level: 4,
    levelingRate: "Medium Fast",
    requiredExperience: 64,
  },
  "4-Medium Slow": {
    level: 4,
    levelingRate: "Medium Slow",
    requiredExperience: 96,
  },
  "4-Slow": {
    level: 4,
    levelingRate: "Slow",
    requiredExperience: 80,
  },
  "4-Fluctuating": {
    level: 4,
    levelingRate: "Fluctuating",
    requiredExperience: 32,
  },
  "5-Erratic": {
    level: 5,
    levelingRate: "Erratic",
    requiredExperience: 237,
  },
  "5-Fast": {
    level: 5,
    levelingRate: "Fast",
    requiredExperience: 100,
  },
  "5-Medium Fast": {
    level: 5,
    levelingRate: "Medium Fast",
    requiredExperience: 125,
  },
  "5-Medium Slow": {
    level: 5,
    levelingRate: "Medium Slow",
    requiredExperience: 135,
  },
  "5-Slow": {
    level: 5,
    levelingRate: "Slow",
    requiredExperience: 156,
  },
  "5-Fluctuating": {
    level: 5,
    levelingRate: "Fluctuating",
    requiredExperience: 65,
  },
  "6-Erratic": {
    level: 6,
    levelingRate: "Erratic",
    requiredExperience: 406,
  },
  "6-Fast": {
    level: 6,
    levelingRate: "Fast",
    requiredExperience: 172,
  },
  "6-Medium Fast": {
    level: 6,
    levelingRate: "Medium Fast",
    requiredExperience: 216,
  },
  "6-Medium Slow": {
    level: 6,
    levelingRate: "Medium Slow",
    requiredExperience: 179,
  },
  "6-Slow": {
    level: 6,
    levelingRate: "Slow",
    requiredExperience: 270,
  },
  "6-Fluctuating": {
    level: 6,
    levelingRate: "Fluctuating",
    requiredExperience: 112,
  },
  "7-Erratic": {
    level: 7,
    levelingRate: "Erratic",
    requiredExperience: 637,
  },
  "7-Fast": {
    level: 7,
    levelingRate: "Fast",
    requiredExperience: 274,
  },
  "7-Medium Fast": {
    level: 7,
    levelingRate: "Medium Fast",
    requiredExperience: 343,
  },
  "7-Medium Slow": {
    level: 7,
    levelingRate: "Medium Slow",
    requiredExperience: 236,
  },
  "7-Slow": {
    level: 7,
    levelingRate: "Slow",
    requiredExperience: 428,
  },
  "7-Fluctuating": {
    level: 7,
    levelingRate: "Fluctuating",
    requiredExperience: 178,
  },
  "8-Erratic": {
    level: 8,
    levelingRate: "Erratic",
    requiredExperience: 942,
  },
  "8-Fast": {
    level: 8,
    levelingRate: "Fast",
    requiredExperience: 409,
  },
  "8-Medium Fast": {
    level: 8,
    levelingRate: "Medium Fast",
    requiredExperience: 512,
  },
  "8-Medium Slow": {
    level: 8,
    levelingRate: "Medium Slow",
    requiredExperience: 314,
  },
  "8-Slow": {
    level: 8,
    levelingRate: "Slow",
    requiredExperience: 640,
  },
  "8-Fluctuating": {
    level: 8,
    levelingRate: "Fluctuating",
    requiredExperience: 276,
  },
  "9-Erratic": {
    level: 9,
    levelingRate: "Erratic",
    requiredExperience: 1326,
  },
  "9-Fast": {
    level: 9,
    levelingRate: "Fast",
    requiredExperience: 583,
  },
  "9-Medium Fast": {
    level: 9,
    levelingRate: "Medium Fast",
    requiredExperience: 729,
  },
  "9-Medium Slow": {
    level: 9,
    levelingRate: "Medium Slow",
    requiredExperience: 419,
  },
  "9-Slow": {
    level: 9,
    levelingRate: "Slow",
    requiredExperience: 911,
  },
  "9-Fluctuating": {
    level: 9,
    levelingRate: "Fluctuating",
    requiredExperience: 393,
  },
  "10-Erratic": {
    level: 10,
    levelingRate: "Erratic",
    requiredExperience: 1800,
  },
  "10-Fast": {
    level: 10,
    levelingRate: "Fast",
    requiredExperience: 800,
  },
  "10-Medium Fast": {
    level: 10,
    levelingRate: "Medium Fast",
    requiredExperience: 1000,
  },
  "10-Medium Slow": {
    level: 10,
    levelingRate: "Medium Slow",
    requiredExperience: 560,
  },
  "10-Slow": {
    level: 10,
    levelingRate: "Slow",
    requiredExperience: 1250,
  },
  "10-Fluctuating": {
    level: 10,
    levelingRate: "Fluctuating",
    requiredExperience: 540,
  },
  "11-Erratic": {
    level: 11,
    levelingRate: "Erratic",
    requiredExperience: 2369,
  },
  "11-Fast": {
    level: 11,
    levelingRate: "Fast",
    requiredExperience: 1064,
  },
  "11-Medium Fast": {
    level: 11,
    levelingRate: "Medium Fast",
    requiredExperience: 1331,
  },
  "11-Medium Slow": {
    level: 11,
    levelingRate: "Medium Slow",
    requiredExperience: 742,
  },
  "11-Slow": {
    level: 11,
    levelingRate: "Slow",
    requiredExperience: 1663,
  },
  "11-Fluctuating": {
    level: 11,
    levelingRate: "Fluctuating",
    requiredExperience: 745,
  },
  "12-Erratic": {
    level: 12,
    levelingRate: "Erratic",
    requiredExperience: 3041,
  },
  "12-Fast": {
    level: 12,
    levelingRate: "Fast",
    requiredExperience: 1382,
  },
  "12-Medium Fast": {
    level: 12,
    levelingRate: "Medium Fast",
    requiredExperience: 1728,
  },
  "12-Medium Slow": {
    level: 12,
    levelingRate: "Medium Slow",
    requiredExperience: 973,
  },
  "12-Slow": {
    level: 12,
    levelingRate: "Slow",
    requiredExperience: 2160,
  },
  "12-Fluctuating": {
    level: 12,
    levelingRate: "Fluctuating",
    requiredExperience: 967,
  },
  "13-Erratic": {
    level: 13,
    levelingRate: "Erratic",
    requiredExperience: 3822,
  },
  "13-Fast": {
    level: 13,
    levelingRate: "Fast",
    requiredExperience: 1757,
  },
  "13-Medium Fast": {
    level: 13,
    levelingRate: "Medium Fast",
    requiredExperience: 2197,
  },
  "13-Medium Slow": {
    level: 13,
    levelingRate: "Medium Slow",
    requiredExperience: 1261,
  },
  "13-Slow": {
    level: 13,
    levelingRate: "Slow",
    requiredExperience: 2746,
  },
  "13-Fluctuating": {
    level: 13,
    levelingRate: "Fluctuating",
    requiredExperience: 1230,
  },
  "14-Erratic": {
    level: 14,
    levelingRate: "Erratic",
    requiredExperience: 4719,
  },
  "14-Fast": {
    level: 14,
    levelingRate: "Fast",
    requiredExperience: 2195,
  },
  "14-Medium Fast": {
    level: 14,
    levelingRate: "Medium Fast",
    requiredExperience: 2744,
  },
  "14-Medium Slow": {
    level: 14,
    levelingRate: "Medium Slow",
    requiredExperience: 1612,
  },
  "14-Slow": {
    level: 14,
    levelingRate: "Slow",
    requiredExperience: 3430,
  },
  "14-Fluctuating": {
    level: 14,
    levelingRate: "Fluctuating",
    requiredExperience: 1591,
  },
  "15-Erratic": {
    level: 15,
    levelingRate: "Erratic",
    requiredExperience: 5737,
  },
  "15-Fast": {
    level: 15,
    levelingRate: "Fast",
    requiredExperience: 2700,
  },
  "15-Medium Fast": {
    level: 15,
    levelingRate: "Medium Fast",
    requiredExperience: 3375,
  },
  "15-Medium Slow": {
    level: 15,
    levelingRate: "Medium Slow",
    requiredExperience: 2035,
  },
  "15-Slow": {
    level: 15,
    levelingRate: "Slow",
    requiredExperience: 4218,
  },
  "15-Fluctuating": {
    level: 15,
    levelingRate: "Fluctuating",
    requiredExperience: 1957,
  },
  "16-Erratic": {
    level: 16,
    levelingRate: "Erratic",
    requiredExperience: 6881,
  },
  "16-Fast": {
    level: 16,
    levelingRate: "Fast",
    requiredExperience: 3276,
  },
  "16-Medium Fast": {
    level: 16,
    levelingRate: "Medium Fast",
    requiredExperience: 4096,
  },
  "16-Medium Slow": {
    level: 16,
    levelingRate: "Medium Slow",
    requiredExperience: 2535,
  },
  "16-Slow": {
    level: 16,
    levelingRate: "Slow",
    requiredExperience: 5120,
  },
  "16-Fluctuating": {
    level: 16,
    levelingRate: "Fluctuating",
    requiredExperience: 2457,
  },
  "17-Erratic": {
    level: 17,
    levelingRate: "Erratic",
    requiredExperience: 8155,
  },
  "17-Fast": {
    level: 17,
    levelingRate: "Fast",
    requiredExperience: 3930,
  },
  "17-Medium Fast": {
    level: 17,
    levelingRate: "Medium Fast",
    requiredExperience: 4913,
  },
  "17-Medium Slow": {
    level: 17,
    levelingRate: "Medium Slow",
    requiredExperience: 3120,
  },
  "17-Slow": {
    level: 17,
    levelingRate: "Slow",
    requiredExperience: 6141,
  },
  "17-Fluctuating": {
    level: 17,
    levelingRate: "Fluctuating",
    requiredExperience: 3046,
  },
  "18-Erratic": {
    level: 18,
    levelingRate: "Erratic",
    requiredExperience: 9564,
  },
  "18-Fast": {
    level: 18,
    levelingRate: "Fast",
    requiredExperience: 4665,
  },
  "18-Medium Fast": {
    level: 18,
    levelingRate: "Medium Fast",
    requiredExperience: 5832,
  },
  "18-Medium Slow": {
    level: 18,
    levelingRate: "Medium Slow",
    requiredExperience: 3798,
  },
  "18-Slow": {
    level: 18,
    levelingRate: "Slow",
    requiredExperience: 7290,
  },
  "18-Fluctuating": {
    level: 18,
    levelingRate: "Fluctuating",
    requiredExperience: 3732,
  },
  "19-Erratic": {
    level: 19,
    levelingRate: "Erratic",
    requiredExperience: 11111,
  },
  "19-Fast": {
    level: 19,
    levelingRate: "Fast",
    requiredExperience: 5487,
  },
  "19-Medium Fast": {
    level: 19,
    levelingRate: "Medium Fast",
    requiredExperience: 6859,
  },
  "19-Medium Slow": {
    level: 19,
    levelingRate: "Medium Slow",
    requiredExperience: 4575,
  },
  "19-Slow": {
    level: 19,
    levelingRate: "Slow",
    requiredExperience: 8573,
  },
  "19-Fluctuating": {
    level: 19,
    levelingRate: "Fluctuating",
    requiredExperience: 4526,
  },
  "20-Erratic": {
    level: 20,
    levelingRate: "Erratic",
    requiredExperience: 12800,
  },
  "20-Fast": {
    level: 20,
    levelingRate: "Fast",
    requiredExperience: 6400,
  },
  "20-Medium Fast": {
    level: 20,
    levelingRate: "Medium Fast",
    requiredExperience: 8000,
  },
  "20-Medium Slow": {
    level: 20,
    levelingRate: "Medium Slow",
    requiredExperience: 5460,
  },
  "20-Slow": {
    level: 20,
    levelingRate: "Slow",
    requiredExperience: 10000,
  },
  "20-Fluctuating": {
    level: 20,
    levelingRate: "Fluctuating",
    requiredExperience: 5440,
  },
  "21-Erratic": {
    level: 21,
    levelingRate: "Erratic",
    requiredExperience: 14632,
  },
  "21-Fast": {
    level: 21,
    levelingRate: "Fast",
    requiredExperience: 7408,
  },
  "21-Medium Fast": {
    level: 21,
    levelingRate: "Medium Fast",
    requiredExperience: 9261,
  },
  "21-Medium Slow": {
    level: 21,
    levelingRate: "Medium Slow",
    requiredExperience: 6458,
  },
  "21-Slow": {
    level: 21,
    levelingRate: "Slow",
    requiredExperience: 11576,
  },
  "21-Fluctuating": {
    level: 21,
    levelingRate: "Fluctuating",
    requiredExperience: 6482,
  },
  "22-Erratic": {
    level: 22,
    levelingRate: "Erratic",
    requiredExperience: 16610,
  },
  "22-Fast": {
    level: 22,
    levelingRate: "Fast",
    requiredExperience: 8518,
  },
  "22-Medium Fast": {
    level: 22,
    levelingRate: "Medium Fast",
    requiredExperience: 10648,
  },
  "22-Medium Slow": {
    level: 22,
    levelingRate: "Medium Slow",
    requiredExperience: 7577,
  },
  "22-Slow": {
    level: 22,
    levelingRate: "Slow",
    requiredExperience: 13310,
  },
  "22-Fluctuating": {
    level: 22,
    levelingRate: "Fluctuating",
    requiredExperience: 7666,
  },
  "23-Erratic": {
    level: 23,
    levelingRate: "Erratic",
    requiredExperience: 18737,
  },
  "23-Fast": {
    level: 23,
    levelingRate: "Fast",
    requiredExperience: 9733,
  },
  "23-Medium Fast": {
    level: 23,
    levelingRate: "Medium Fast",
    requiredExperience: 12167,
  },
  "23-Medium Slow": {
    level: 23,
    levelingRate: "Medium Slow",
    requiredExperience: 8825,
  },
  "23-Slow": {
    level: 23,
    levelingRate: "Slow",
    requiredExperience: 15208,
  },
  "23-Fluctuating": {
    level: 23,
    levelingRate: "Fluctuating",
    requiredExperience: 9003,
  },
  "24-Erratic": {
    level: 24,
    levelingRate: "Erratic",
    requiredExperience: 21012,
  },
  "24-Fast": {
    level: 24,
    levelingRate: "Fast",
    requiredExperience: 11059,
  },
  "24-Medium Fast": {
    level: 24,
    levelingRate: "Medium Fast",
    requiredExperience: 13824,
  },
  "24-Medium Slow": {
    level: 24,
    levelingRate: "Medium Slow",
    requiredExperience: 10208,
  },
  "24-Slow": {
    level: 24,
    levelingRate: "Slow",
    requiredExperience: 17280,
  },
  "24-Fluctuating": {
    level: 24,
    levelingRate: "Fluctuating",
    requiredExperience: 10506,
  },
  "25-Erratic": {
    level: 25,
    levelingRate: "Erratic",
    requiredExperience: 23437,
  },
  "25-Fast": {
    level: 25,
    levelingRate: "Fast",
    requiredExperience: 12500,
  },
  "25-Medium Fast": {
    level: 25,
    levelingRate: "Medium Fast",
    requiredExperience: 15625,
  },
  "25-Medium Slow": {
    level: 25,
    levelingRate: "Medium Slow",
    requiredExperience: 11735,
  },
  "25-Slow": {
    level: 25,
    levelingRate: "Slow",
    requiredExperience: 19531,
  },
  "25-Fluctuating": {
    level: 25,
    levelingRate: "Fluctuating",
    requiredExperience: 12187,
  },
  "26-Erratic": {
    level: 26,
    levelingRate: "Erratic",
    requiredExperience: 26012,
  },
  "26-Fast": {
    level: 26,
    levelingRate: "Fast",
    requiredExperience: 14060,
  },
  "26-Medium Fast": {
    level: 26,
    levelingRate: "Medium Fast",
    requiredExperience: 17576,
  },
  "26-Medium Slow": {
    level: 26,
    levelingRate: "Medium Slow",
    requiredExperience: 13411,
  },
  "26-Slow": {
    level: 26,
    levelingRate: "Slow",
    requiredExperience: 21970,
  },
  "26-Fluctuating": {
    level: 26,
    levelingRate: "Fluctuating",
    requiredExperience: 14060,
  },
  "27-Erratic": {
    level: 27,
    levelingRate: "Erratic",
    requiredExperience: 28737,
  },
  "27-Fast": {
    level: 27,
    levelingRate: "Fast",
    requiredExperience: 15746,
  },
  "27-Medium Fast": {
    level: 27,
    levelingRate: "Medium Fast",
    requiredExperience: 19683,
  },
  "27-Medium Slow": {
    level: 27,
    levelingRate: "Medium Slow",
    requiredExperience: 15244,
  },
  "27-Slow": {
    level: 27,
    levelingRate: "Slow",
    requiredExperience: 24603,
  },
  "27-Fluctuating": {
    level: 27,
    levelingRate: "Fluctuating",
    requiredExperience: 16140,
  },
  "28-Erratic": {
    level: 28,
    levelingRate: "Erratic",
    requiredExperience: 31610,
  },
  "28-Fast": {
    level: 28,
    levelingRate: "Fast",
    requiredExperience: 17561,
  },
  "28-Medium Fast": {
    level: 28,
    levelingRate: "Medium Fast",
    requiredExperience: 21952,
  },
  "28-Medium Slow": {
    level: 28,
    levelingRate: "Medium Slow",
    requiredExperience: 17242,
  },
  "28-Slow": {
    level: 28,
    levelingRate: "Slow",
    requiredExperience: 27440,
  },
  "28-Fluctuating": {
    level: 28,
    levelingRate: "Fluctuating",
    requiredExperience: 18439,
  },
  "29-Erratic": {
    level: 29,
    levelingRate: "Erratic",
    requiredExperience: 34632,
  },
  "29-Fast": {
    level: 29,
    levelingRate: "Fast",
    requiredExperience: 19511,
  },
  "29-Medium Fast": {
    level: 29,
    levelingRate: "Medium Fast",
    requiredExperience: 24389,
  },
  "29-Medium Slow": {
    level: 29,
    levelingRate: "Medium Slow",
    requiredExperience: 19411,
  },
  "29-Slow": {
    level: 29,
    levelingRate: "Slow",
    requiredExperience: 30486,
  },
  "29-Fluctuating": {
    level: 29,
    levelingRate: "Fluctuating",
    requiredExperience: 20974,
  },
  "30-Erratic": {
    level: 30,
    levelingRate: "Erratic",
    requiredExperience: 37800,
  },
  "30-Fast": {
    level: 30,
    levelingRate: "Fast",
    requiredExperience: 21600,
  },
  "30-Medium Fast": {
    level: 30,
    levelingRate: "Medium Fast",
    requiredExperience: 27000,
  },
  "30-Medium Slow": {
    level: 30,
    levelingRate: "Medium Slow",
    requiredExperience: 21760,
  },
  "30-Slow": {
    level: 30,
    levelingRate: "Slow",
    requiredExperience: 33750,
  },
  "30-Fluctuating": {
    level: 30,
    levelingRate: "Fluctuating",
    requiredExperience: 23760,
  },
  "31-Erratic": {
    level: 31,
    levelingRate: "Erratic",
    requiredExperience: 41111,
  },
  "31-Fast": {
    level: 31,
    levelingRate: "Fast",
    requiredExperience: 23832,
  },
  "31-Medium Fast": {
    level: 31,
    levelingRate: "Medium Fast",
    requiredExperience: 29791,
  },
  "31-Medium Slow": {
    level: 31,
    levelingRate: "Medium Slow",
    requiredExperience: 24294,
  },
  "31-Slow": {
    level: 31,
    levelingRate: "Slow",
    requiredExperience: 37238,
  },
  "31-Fluctuating": {
    level: 31,
    levelingRate: "Fluctuating",
    requiredExperience: 26811,
  },
  "32-Erratic": {
    level: 32,
    levelingRate: "Erratic",
    requiredExperience: 44564,
  },
  "32-Fast": {
    level: 32,
    levelingRate: "Fast",
    requiredExperience: 26214,
  },
  "32-Medium Fast": {
    level: 32,
    levelingRate: "Medium Fast",
    requiredExperience: 32768,
  },
  "32-Medium Slow": {
    level: 32,
    levelingRate: "Medium Slow",
    requiredExperience: 27021,
  },
  "32-Slow": {
    level: 32,
    levelingRate: "Slow",
    requiredExperience: 40960,
  },
  "32-Fluctuating": {
    level: 32,
    levelingRate: "Fluctuating",
    requiredExperience: 30146,
  },
  "33-Erratic": {
    level: 33,
    levelingRate: "Erratic",
    requiredExperience: 48155,
  },
  "33-Fast": {
    level: 33,
    levelingRate: "Fast",
    requiredExperience: 28749,
  },
  "33-Medium Fast": {
    level: 33,
    levelingRate: "Medium Fast",
    requiredExperience: 35937,
  },
  "33-Medium Slow": {
    level: 33,
    levelingRate: "Medium Slow",
    requiredExperience: 29949,
  },
  "33-Slow": {
    level: 33,
    levelingRate: "Slow",
    requiredExperience: 44921,
  },
  "33-Fluctuating": {
    level: 33,
    levelingRate: "Fluctuating",
    requiredExperience: 33780,
  },
  "34-Erratic": {
    level: 34,
    levelingRate: "Erratic",
    requiredExperience: 51881,
  },
  "34-Fast": {
    level: 34,
    levelingRate: "Fast",
    requiredExperience: 31443,
  },
  "34-Medium Fast": {
    level: 34,
    levelingRate: "Medium Fast",
    requiredExperience: 39304,
  },
  "34-Medium Slow": {
    level: 34,
    levelingRate: "Medium Slow",
    requiredExperience: 33084,
  },
  "34-Slow": {
    level: 34,
    levelingRate: "Slow",
    requiredExperience: 49130,
  },
  "34-Fluctuating": {
    level: 34,
    levelingRate: "Fluctuating",
    requiredExperience: 37731,
  },
  "35-Erratic": {
    level: 35,
    levelingRate: "Erratic",
    requiredExperience: 55737,
  },
  "35-Fast": {
    level: 35,
    levelingRate: "Fast",
    requiredExperience: 34300,
  },
  "35-Medium Fast": {
    level: 35,
    levelingRate: "Medium Fast",
    requiredExperience: 42875,
  },
  "35-Medium Slow": {
    level: 35,
    levelingRate: "Medium Slow",
    requiredExperience: 36435,
  },
  "35-Slow": {
    level: 35,
    levelingRate: "Slow",
    requiredExperience: 53593,
  },
  "35-Fluctuating": {
    level: 35,
    levelingRate: "Fluctuating",
    requiredExperience: 42017,
  },
  "36-Erratic": {
    level: 36,
    levelingRate: "Erratic",
    requiredExperience: 59719,
  },
  "36-Fast": {
    level: 36,
    levelingRate: "Fast",
    requiredExperience: 37324,
  },
  "36-Medium Fast": {
    level: 36,
    levelingRate: "Medium Fast",
    requiredExperience: 46656,
  },
  "36-Medium Slow": {
    level: 36,
    levelingRate: "Medium Slow",
    requiredExperience: 40007,
  },
  "36-Slow": {
    level: 36,
    levelingRate: "Slow",
    requiredExperience: 58320,
  },
  "36-Fluctuating": {
    level: 36,
    levelingRate: "Fluctuating",
    requiredExperience: 46656,
  },
  "37-Erratic": {
    level: 37,
    levelingRate: "Erratic",
    requiredExperience: 63822,
  },
  "37-Fast": {
    level: 37,
    levelingRate: "Fast",
    requiredExperience: 40522,
  },
  "37-Medium Fast": {
    level: 37,
    levelingRate: "Medium Fast",
    requiredExperience: 50653,
  },
  "37-Medium Slow": {
    level: 37,
    levelingRate: "Medium Slow",
    requiredExperience: 43808,
  },
  "37-Slow": {
    level: 37,
    levelingRate: "Slow",
    requiredExperience: 63316,
  },
  "37-Fluctuating": {
    level: 37,
    levelingRate: "Fluctuating",
    requiredExperience: 50653,
  },
  "38-Erratic": {
    level: 38,
    levelingRate: "Erratic",
    requiredExperience: 68041,
  },
  "38-Fast": {
    level: 38,
    levelingRate: "Fast",
    requiredExperience: 43897,
  },
  "38-Medium Fast": {
    level: 38,
    levelingRate: "Medium Fast",
    requiredExperience: 54872,
  },
  "38-Medium Slow": {
    level: 38,
    levelingRate: "Medium Slow",
    requiredExperience: 47846,
  },
  "38-Slow": {
    level: 38,
    levelingRate: "Slow",
    requiredExperience: 68590,
  },
  "38-Fluctuating": {
    level: 38,
    levelingRate: "Fluctuating",
    requiredExperience: 55969,
  },
  "39-Erratic": {
    level: 39,
    levelingRate: "Erratic",
    requiredExperience: 72369,
  },
  "39-Fast": {
    level: 39,
    levelingRate: "Fast",
    requiredExperience: 47455,
  },
  "39-Medium Fast": {
    level: 39,
    levelingRate: "Medium Fast",
    requiredExperience: 59319,
  },
  "39-Medium Slow": {
    level: 39,
    levelingRate: "Medium Slow",
    requiredExperience: 52127,
  },
  "39-Slow": {
    level: 39,
    levelingRate: "Slow",
    requiredExperience: 74148,
  },
  "39-Fluctuating": {
    level: 39,
    levelingRate: "Fluctuating",
    requiredExperience: 60505,
  },
  "40-Erratic": {
    level: 40,
    levelingRate: "Erratic",
    requiredExperience: 76800,
  },
  "40-Fast": {
    level: 40,
    levelingRate: "Fast",
    requiredExperience: 51200,
  },
  "40-Medium Fast": {
    level: 40,
    levelingRate: "Medium Fast",
    requiredExperience: 64000,
  },
  "40-Medium Slow": {
    level: 40,
    levelingRate: "Medium Slow",
    requiredExperience: 56660,
  },
  "40-Slow": {
    level: 40,
    levelingRate: "Slow",
    requiredExperience: 80000,
  },
  "40-Fluctuating": {
    level: 40,
    levelingRate: "Fluctuating",
    requiredExperience: 66560,
  },
  "41-Erratic": {
    level: 41,
    levelingRate: "Erratic",
    requiredExperience: 81326,
  },
  "41-Fast": {
    level: 41,
    levelingRate: "Fast",
    requiredExperience: 55136,
  },
  "41-Medium Fast": {
    level: 41,
    levelingRate: "Medium Fast",
    requiredExperience: 68921,
  },
  "41-Medium Slow": {
    level: 41,
    levelingRate: "Medium Slow",
    requiredExperience: 61450,
  },
  "41-Slow": {
    level: 41,
    levelingRate: "Slow",
    requiredExperience: 86151,
  },
  "41-Fluctuating": {
    level: 41,
    levelingRate: "Fluctuating",
    requiredExperience: 71677,
  },
  "42-Erratic": {
    level: 42,
    levelingRate: "Erratic",
    requiredExperience: 85942,
  },
  "42-Fast": {
    level: 42,
    levelingRate: "Fast",
    requiredExperience: 59270,
  },
  "42-Medium Fast": {
    level: 42,
    levelingRate: "Medium Fast",
    requiredExperience: 74088,
  },
  "42-Medium Slow": {
    level: 42,
    levelingRate: "Medium Slow",
    requiredExperience: 66505,
  },
  "42-Slow": {
    level: 42,
    levelingRate: "Slow",
    requiredExperience: 92610,
  },
  "42-Fluctuating": {
    level: 42,
    levelingRate: "Fluctuating",
    requiredExperience: 78533,
  },
  "43-Erratic": {
    level: 43,
    levelingRate: "Erratic",
    requiredExperience: 90637,
  },
  "43-Fast": {
    level: 43,
    levelingRate: "Fast",
    requiredExperience: 63605,
  },
  "43-Medium Fast": {
    level: 43,
    levelingRate: "Medium Fast",
    requiredExperience: 79507,
  },
  "43-Medium Slow": {
    level: 43,
    levelingRate: "Medium Slow",
    requiredExperience: 71833,
  },
  "43-Slow": {
    level: 43,
    levelingRate: "Slow",
    requiredExperience: 99383,
  },
  "43-Fluctuating": {
    level: 43,
    levelingRate: "Fluctuating",
    requiredExperience: 84277,
  },
  "44-Erratic": {
    level: 44,
    levelingRate: "Erratic",
    requiredExperience: 95406,
  },
  "44-Fast": {
    level: 44,
    levelingRate: "Fast",
    requiredExperience: 68147,
  },
  "44-Medium Fast": {
    level: 44,
    levelingRate: "Medium Fast",
    requiredExperience: 85184,
  },
  "44-Medium Slow": {
    level: 44,
    levelingRate: "Medium Slow",
    requiredExperience: 77440,
  },
  "44-Slow": {
    level: 44,
    levelingRate: "Slow",
    requiredExperience: 106480,
  },
  "44-Fluctuating": {
    level: 44,
    levelingRate: "Fluctuating",
    requiredExperience: 91998,
  },
  "45-Erratic": {
    level: 45,
    levelingRate: "Erratic",
    requiredExperience: 100237,
  },
  "45-Fast": {
    level: 45,
    levelingRate: "Fast",
    requiredExperience: 72900,
  },
  "45-Medium Fast": {
    level: 45,
    levelingRate: "Medium Fast",
    requiredExperience: 91125,
  },
  "45-Medium Slow": {
    level: 45,
    levelingRate: "Medium Slow",
    requiredExperience: 83335,
  },
  "45-Slow": {
    level: 45,
    levelingRate: "Slow",
    requiredExperience: 113906,
  },
  "45-Fluctuating": {
    level: 45,
    levelingRate: "Fluctuating",
    requiredExperience: 98415,
  },
  "46-Erratic": {
    level: 46,
    levelingRate: "Erratic",
    requiredExperience: 105122,
  },
  "46-Fast": {
    level: 46,
    levelingRate: "Fast",
    requiredExperience: 77868,
  },
  "46-Medium Fast": {
    level: 46,
    levelingRate: "Medium Fast",
    requiredExperience: 97336,
  },
  "46-Medium Slow": {
    level: 46,
    levelingRate: "Medium Slow",
    requiredExperience: 89523,
  },
  "46-Slow": {
    level: 46,
    levelingRate: "Slow",
    requiredExperience: 121670,
  },
  "46-Fluctuating": {
    level: 46,
    levelingRate: "Fluctuating",
    requiredExperience: 107069,
  },
  "47-Erratic": {
    level: 47,
    levelingRate: "Erratic",
    requiredExperience: 110052,
  },
  "47-Fast": {
    level: 47,
    levelingRate: "Fast",
    requiredExperience: 83058,
  },
  "47-Medium Fast": {
    level: 47,
    levelingRate: "Medium Fast",
    requiredExperience: 103823,
  },
  "47-Medium Slow": {
    level: 47,
    levelingRate: "Medium Slow",
    requiredExperience: 96012,
  },
  "47-Slow": {
    level: 47,
    levelingRate: "Slow",
    requiredExperience: 129778,
  },
  "47-Fluctuating": {
    level: 47,
    levelingRate: "Fluctuating",
    requiredExperience: 114205,
  },
  "48-Erratic": {
    level: 48,
    levelingRate: "Erratic",
    requiredExperience: 115015,
  },
  "48-Fast": {
    level: 48,
    levelingRate: "Fast",
    requiredExperience: 88473,
  },
  "48-Medium Fast": {
    level: 48,
    levelingRate: "Medium Fast",
    requiredExperience: 110592,
  },
  "48-Medium Slow": {
    level: 48,
    levelingRate: "Medium Slow",
    requiredExperience: 102810,
  },
  "48-Slow": {
    level: 48,
    levelingRate: "Slow",
    requiredExperience: 138240,
  },
  "48-Fluctuating": {
    level: 48,
    levelingRate: "Fluctuating",
    requiredExperience: 123863,
  },
  "49-Erratic": {
    level: 49,
    levelingRate: "Erratic",
    requiredExperience: 120001,
  },
  "49-Fast": {
    level: 49,
    levelingRate: "Fast",
    requiredExperience: 94119,
  },
  "49-Medium Fast": {
    level: 49,
    levelingRate: "Medium Fast",
    requiredExperience: 117649,
  },
  "49-Medium Slow": {
    level: 49,
    levelingRate: "Medium Slow",
    requiredExperience: 109923,
  },
  "49-Slow": {
    level: 49,
    levelingRate: "Slow",
    requiredExperience: 147061,
  },
  "49-Fluctuating": {
    level: 49,
    levelingRate: "Fluctuating",
    requiredExperience: 131766,
  },
  "50-Erratic": {
    level: 50,
    levelingRate: "Erratic",
    requiredExperience: 125000,
  },
  "50-Fast": {
    level: 50,
    levelingRate: "Fast",
    requiredExperience: 100000,
  },
  "50-Medium Fast": {
    level: 50,
    levelingRate: "Medium Fast",
    requiredExperience: 125000,
  },
  "50-Medium Slow": {
    level: 50,
    levelingRate: "Medium Slow",
    requiredExperience: 117360,
  },
  "50-Slow": {
    level: 50,
    levelingRate: "Slow",
    requiredExperience: 156250,
  },
  "50-Fluctuating": {
    level: 50,
    levelingRate: "Fluctuating",
    requiredExperience: 142500,
  },
  "51-Erratic": {
    level: 51,
    levelingRate: "Erratic",
    requiredExperience: 131324,
  },
  "51-Fast": {
    level: 51,
    levelingRate: "Fast",
    requiredExperience: 106120,
  },
  "51-Medium Fast": {
    level: 51,
    levelingRate: "Medium Fast",
    requiredExperience: 132651,
  },
  "51-Medium Slow": {
    level: 51,
    levelingRate: "Medium Slow",
    requiredExperience: 125126,
  },
  "51-Slow": {
    level: 51,
    levelingRate: "Slow",
    requiredExperience: 165813,
  },
  "51-Fluctuating": {
    level: 51,
    levelingRate: "Fluctuating",
    requiredExperience: 151222,
  },
  "52-Erratic": {
    level: 52,
    levelingRate: "Erratic",
    requiredExperience: 137795,
  },
  "52-Fast": {
    level: 52,
    levelingRate: "Fast",
    requiredExperience: 112486,
  },
  "52-Medium Fast": {
    level: 52,
    levelingRate: "Medium Fast",
    requiredExperience: 140608,
  },
  "52-Medium Slow": {
    level: 52,
    levelingRate: "Medium Slow",
    requiredExperience: 133229,
  },
  "52-Slow": {
    level: 52,
    levelingRate: "Slow",
    requiredExperience: 175760,
  },
  "52-Fluctuating": {
    level: 52,
    levelingRate: "Fluctuating",
    requiredExperience: 163105,
  },
  "53-Erratic": {
    level: 53,
    levelingRate: "Erratic",
    requiredExperience: 144410,
  },
  "53-Fast": {
    level: 53,
    levelingRate: "Fast",
    requiredExperience: 119101,
  },
  "53-Medium Fast": {
    level: 53,
    levelingRate: "Medium Fast",
    requiredExperience: 148877,
  },
  "53-Medium Slow": {
    level: 53,
    levelingRate: "Medium Slow",
    requiredExperience: 141677,
  },
  "53-Slow": {
    level: 53,
    levelingRate: "Slow",
    requiredExperience: 186096,
  },
  "53-Fluctuating": {
    level: 53,
    levelingRate: "Fluctuating",
    requiredExperience: 172697,
  },
  "54-Erratic": {
    level: 54,
    levelingRate: "Erratic",
    requiredExperience: 151165,
  },
  "54-Fast": {
    level: 54,
    levelingRate: "Fast",
    requiredExperience: 125971,
  },
  "54-Medium Fast": {
    level: 54,
    levelingRate: "Medium Fast",
    requiredExperience: 157464,
  },
  "54-Medium Slow": {
    level: 54,
    levelingRate: "Medium Slow",
    requiredExperience: 150476,
  },
  "54-Slow": {
    level: 54,
    levelingRate: "Slow",
    requiredExperience: 196830,
  },
  "54-Fluctuating": {
    level: 54,
    levelingRate: "Fluctuating",
    requiredExperience: 185807,
  },
  "55-Erratic": {
    level: 55,
    levelingRate: "Erratic",
    requiredExperience: 158056,
  },
  "55-Fast": {
    level: 55,
    levelingRate: "Fast",
    requiredExperience: 133100,
  },
  "55-Medium Fast": {
    level: 55,
    levelingRate: "Medium Fast",
    requiredExperience: 166375,
  },
  "55-Medium Slow": {
    level: 55,
    levelingRate: "Medium Slow",
    requiredExperience: 159635,
  },
  "55-Slow": {
    level: 55,
    levelingRate: "Slow",
    requiredExperience: 207968,
  },
  "55-Fluctuating": {
    level: 55,
    levelingRate: "Fluctuating",
    requiredExperience: 196322,
  },
  "56-Erratic": {
    level: 56,
    levelingRate: "Erratic",
    requiredExperience: 165079,
  },
  "56-Fast": {
    level: 56,
    levelingRate: "Fast",
    requiredExperience: 140492,
  },
  "56-Medium Fast": {
    level: 56,
    levelingRate: "Medium Fast",
    requiredExperience: 175616,
  },
  "56-Medium Slow": {
    level: 56,
    levelingRate: "Medium Slow",
    requiredExperience: 169159,
  },
  "56-Slow": {
    level: 56,
    levelingRate: "Slow",
    requiredExperience: 219520,
  },
  "56-Fluctuating": {
    level: 56,
    levelingRate: "Fluctuating",
    requiredExperience: 210739,
  },
  "57-Erratic": {
    level: 57,
    levelingRate: "Erratic",
    requiredExperience: 172229,
  },
  "57-Fast": {
    level: 57,
    levelingRate: "Fast",
    requiredExperience: 148154,
  },
  "57-Medium Fast": {
    level: 57,
    levelingRate: "Medium Fast",
    requiredExperience: 185193,
  },
  "57-Medium Slow": {
    level: 57,
    levelingRate: "Medium Slow",
    requiredExperience: 179056,
  },
  "57-Slow": {
    level: 57,
    levelingRate: "Slow",
    requiredExperience: 231491,
  },
  "57-Fluctuating": {
    level: 57,
    levelingRate: "Fluctuating",
    requiredExperience: 222231,
  },
  "58-Erratic": {
    level: 58,
    levelingRate: "Erratic",
    requiredExperience: 179503,
  },
  "58-Fast": {
    level: 58,
    levelingRate: "Fast",
    requiredExperience: 156089,
  },
  "58-Medium Fast": {
    level: 58,
    levelingRate: "Medium Fast",
    requiredExperience: 195112,
  },
  "58-Medium Slow": {
    level: 58,
    levelingRate: "Medium Slow",
    requiredExperience: 189334,
  },
  "58-Slow": {
    level: 58,
    levelingRate: "Slow",
    requiredExperience: 243890,
  },
  "58-Fluctuating": {
    level: 58,
    levelingRate: "Fluctuating",
    requiredExperience: 238036,
  },
  "59-Erratic": {
    level: 59,
    levelingRate: "Erratic",
    requiredExperience: 186894,
  },
  "59-Fast": {
    level: 59,
    levelingRate: "Fast",
    requiredExperience: 164303,
  },
  "59-Medium Fast": {
    level: 59,
    levelingRate: "Medium Fast",
    requiredExperience: 205379,
  },
  "59-Medium Slow": {
    level: 59,
    levelingRate: "Medium Slow",
    requiredExperience: 199999,
  },
  "59-Slow": {
    level: 59,
    levelingRate: "Slow",
    requiredExperience: 256723,
  },
  "59-Fluctuating": {
    level: 59,
    levelingRate: "Fluctuating",
    requiredExperience: 250562,
  },
  "60-Erratic": {
    level: 60,
    levelingRate: "Erratic",
    requiredExperience: 194400,
  },
  "60-Fast": {
    level: 60,
    levelingRate: "Fast",
    requiredExperience: 172800,
  },
  "60-Medium Fast": {
    level: 60,
    levelingRate: "Medium Fast",
    requiredExperience: 216000,
  },
  "60-Medium Slow": {
    level: 60,
    levelingRate: "Medium Slow",
    requiredExperience: 211060,
  },
  "60-Slow": {
    level: 60,
    levelingRate: "Slow",
    requiredExperience: 270000,
  },
  "60-Fluctuating": {
    level: 60,
    levelingRate: "Fluctuating",
    requiredExperience: 267840,
  },
  "61-Erratic": {
    level: 61,
    levelingRate: "Erratic",
    requiredExperience: 202013,
  },
  "61-Fast": {
    level: 61,
    levelingRate: "Fast",
    requiredExperience: 181584,
  },
  "61-Medium Fast": {
    level: 61,
    levelingRate: "Medium Fast",
    requiredExperience: 226981,
  },
  "61-Medium Slow": {
    level: 61,
    levelingRate: "Medium Slow",
    requiredExperience: 222522,
  },
  "61-Slow": {
    level: 61,
    levelingRate: "Slow",
    requiredExperience: 283726,
  },
  "61-Fluctuating": {
    level: 61,
    levelingRate: "Fluctuating",
    requiredExperience: 281456,
  },
  "62-Erratic": {
    level: 62,
    levelingRate: "Erratic",
    requiredExperience: 209728,
  },
  "62-Fast": {
    level: 62,
    levelingRate: "Fast",
    requiredExperience: 190662,
  },
  "62-Medium Fast": {
    level: 62,
    levelingRate: "Medium Fast",
    requiredExperience: 238328,
  },
  "62-Medium Slow": {
    level: 62,
    levelingRate: "Medium Slow",
    requiredExperience: 234393,
  },
  "62-Slow": {
    level: 62,
    levelingRate: "Slow",
    requiredExperience: 297910,
  },
  "62-Fluctuating": {
    level: 62,
    levelingRate: "Fluctuating",
    requiredExperience: 300293,
  },
  "63-Erratic": {
    level: 63,
    levelingRate: "Erratic",
    requiredExperience: 217540,
  },
  "63-Fast": {
    level: 63,
    levelingRate: "Fast",
    requiredExperience: 200037,
  },
  "63-Medium Fast": {
    level: 63,
    levelingRate: "Medium Fast",
    requiredExperience: 250047,
  },
  "63-Medium Slow": {
    level: 63,
    levelingRate: "Medium Slow",
    requiredExperience: 246681,
  },
  "63-Slow": {
    level: 63,
    levelingRate: "Slow",
    requiredExperience: 312558,
  },
  "63-Fluctuating": {
    level: 63,
    levelingRate: "Fluctuating",
    requiredExperience: 315059,
  },
  "64-Erratic": {
    level: 64,
    levelingRate: "Erratic",
    requiredExperience: 225443,
  },
  "64-Fast": {
    level: 64,
    levelingRate: "Fast",
    requiredExperience: 209715,
  },
  "64-Medium Fast": {
    level: 64,
    levelingRate: "Medium Fast",
    requiredExperience: 262144,
  },
  "64-Medium Slow": {
    level: 64,
    levelingRate: "Medium Slow",
    requiredExperience: 259392,
  },
  "64-Slow": {
    level: 64,
    levelingRate: "Slow",
    requiredExperience: 327680,
  },
  "64-Fluctuating": {
    level: 64,
    levelingRate: "Fluctuating",
    requiredExperience: 335544,
  },
  "65-Erratic": {
    level: 65,
    levelingRate: "Erratic",
    requiredExperience: 233431,
  },
  "65-Fast": {
    level: 65,
    levelingRate: "Fast",
    requiredExperience: 219700,
  },
  "65-Medium Fast": {
    level: 65,
    levelingRate: "Medium Fast",
    requiredExperience: 274625,
  },
  "65-Medium Slow": {
    level: 65,
    levelingRate: "Medium Slow",
    requiredExperience: 272535,
  },
  "65-Slow": {
    level: 65,
    levelingRate: "Slow",
    requiredExperience: 343281,
  },
  "65-Fluctuating": {
    level: 65,
    levelingRate: "Fluctuating",
    requiredExperience: 351520,
  },
  "66-Erratic": {
    level: 66,
    levelingRate: "Erratic",
    requiredExperience: 241496,
  },
  "66-Fast": {
    level: 66,
    levelingRate: "Fast",
    requiredExperience: 229996,
  },
  "66-Medium Fast": {
    level: 66,
    levelingRate: "Medium Fast",
    requiredExperience: 287496,
  },
  "66-Medium Slow": {
    level: 66,
    levelingRate: "Medium Slow",
    requiredExperience: 286115,
  },
  "66-Slow": {
    level: 66,
    levelingRate: "Slow",
    requiredExperience: 359370,
  },
  "66-Fluctuating": {
    level: 66,
    levelingRate: "Fluctuating",
    requiredExperience: 373744,
  },
  "67-Erratic": {
    level: 67,
    levelingRate: "Erratic",
    requiredExperience: 249633,
  },
  "67-Fast": {
    level: 67,
    levelingRate: "Fast",
    requiredExperience: 240610,
  },
  "67-Medium Fast": {
    level: 67,
    levelingRate: "Medium Fast",
    requiredExperience: 300763,
  },
  "67-Medium Slow": {
    level: 67,
    levelingRate: "Medium Slow",
    requiredExperience: 300140,
  },
  "67-Slow": {
    level: 67,
    levelingRate: "Slow",
    requiredExperience: 375953,
  },
  "67-Fluctuating": {
    level: 67,
    levelingRate: "Fluctuating",
    requiredExperience: 390991,
  },
  "68-Erratic": {
    level: 68,
    levelingRate: "Erratic",
    requiredExperience: 257834,
  },
  "68-Fast": {
    level: 68,
    levelingRate: "Fast",
    requiredExperience: 251545,
  },
  "68-Medium Fast": {
    level: 68,
    levelingRate: "Medium Fast",
    requiredExperience: 314432,
  },
  "68-Medium Slow": {
    level: 68,
    levelingRate: "Medium Slow",
    requiredExperience: 314618,
  },
  "68-Slow": {
    level: 68,
    levelingRate: "Slow",
    requiredExperience: 393040,
  },
  "68-Fluctuating": {
    level: 68,
    levelingRate: "Fluctuating",
    requiredExperience: 415050,
  },
  "69-Erratic": {
    level: 69,
    levelingRate: "Erratic",
    requiredExperience: 267406,
  },
  "69-Fast": {
    level: 69,
    levelingRate: "Fast",
    requiredExperience: 262807,
  },
  "69-Medium Fast": {
    level: 69,
    levelingRate: "Medium Fast",
    requiredExperience: 328509,
  },
  "69-Medium Slow": {
    level: 69,
    levelingRate: "Medium Slow",
    requiredExperience: 329555,
  },
  "69-Slow": {
    level: 69,
    levelingRate: "Slow",
    requiredExperience: 410636,
  },
  "69-Fluctuating": {
    level: 69,
    levelingRate: "Fluctuating",
    requiredExperience: 433631,
  },
  "70-Erratic": {
    level: 70,
    levelingRate: "Erratic",
    requiredExperience: 276458,
  },
  "70-Fast": {
    level: 70,
    levelingRate: "Fast",
    requiredExperience: 274400,
  },
  "70-Medium Fast": {
    level: 70,
    levelingRate: "Medium Fast",
    requiredExperience: 343000,
  },
  "70-Medium Slow": {
    level: 70,
    levelingRate: "Medium Slow",
    requiredExperience: 344960,
  },
  "70-Slow": {
    level: 70,
    levelingRate: "Slow",
    requiredExperience: 428750,
  },
  "70-Fluctuating": {
    level: 70,
    levelingRate: "Fluctuating",
    requiredExperience: 459620,
  },
  "71-Erratic": {
    level: 71,
    levelingRate: "Erratic",
    requiredExperience: 286328,
  },
  "71-Fast": {
    level: 71,
    levelingRate: "Fast",
    requiredExperience: 286328,
  },
  "71-Medium Fast": {
    level: 71,
    levelingRate: "Medium Fast",
    requiredExperience: 357911,
  },
  "71-Medium Slow": {
    level: 71,
    levelingRate: "Medium Slow",
    requiredExperience: 360838,
  },
  "71-Slow": {
    level: 71,
    levelingRate: "Slow",
    requiredExperience: 447388,
  },
  "71-Fluctuating": {
    level: 71,
    levelingRate: "Fluctuating",
    requiredExperience: 479600,
  },
  "72-Erratic": {
    level: 72,
    levelingRate: "Erratic",
    requiredExperience: 296358,
  },
  "72-Fast": {
    level: 72,
    levelingRate: "Fast",
    requiredExperience: 298598,
  },
  "72-Medium Fast": {
    level: 72,
    levelingRate: "Medium Fast",
    requiredExperience: 373248,
  },
  "72-Medium Slow": {
    level: 72,
    levelingRate: "Medium Slow",
    requiredExperience: 377197,
  },
  "72-Slow": {
    level: 72,
    levelingRate: "Slow",
    requiredExperience: 466560,
  },
  "72-Fluctuating": {
    level: 72,
    levelingRate: "Fluctuating",
    requiredExperience: 507617,
  },
  "73-Erratic": {
    level: 73,
    levelingRate: "Erratic",
    requiredExperience: 305767,
  },
  "73-Fast": {
    level: 73,
    levelingRate: "Fast",
    requiredExperience: 311213,
  },
  "73-Medium Fast": {
    level: 73,
    levelingRate: "Medium Fast",
    requiredExperience: 389017,
  },
  "73-Medium Slow": {
    level: 73,
    levelingRate: "Medium Slow",
    requiredExperience: 394045,
  },
  "73-Slow": {
    level: 73,
    levelingRate: "Slow",
    requiredExperience: 486271,
  },
  "73-Fluctuating": {
    level: 73,
    levelingRate: "Fluctuating",
    requiredExperience: 529063,
  },
  "74-Erratic": {
    level: 74,
    levelingRate: "Erratic",
    requiredExperience: 316074,
  },
  "74-Fast": {
    level: 74,
    levelingRate: "Fast",
    requiredExperience: 324179,
  },
  "74-Medium Fast": {
    level: 74,
    levelingRate: "Medium Fast",
    requiredExperience: 405224,
  },
  "74-Medium Slow": {
    level: 74,
    levelingRate: "Medium Slow",
    requiredExperience: 411388,
  },
  "74-Slow": {
    level: 74,
    levelingRate: "Slow",
    requiredExperience: 506530,
  },
  "74-Fluctuating": {
    level: 74,
    levelingRate: "Fluctuating",
    requiredExperience: 559209,
  },
  "75-Erratic": {
    level: 75,
    levelingRate: "Erratic",
    requiredExperience: 326531,
  },
  "75-Fast": {
    level: 75,
    levelingRate: "Fast",
    requiredExperience: 337500,
  },
  "75-Medium Fast": {
    level: 75,
    levelingRate: "Medium Fast",
    requiredExperience: 421875,
  },
  "75-Medium Slow": {
    level: 75,
    levelingRate: "Medium Slow",
    requiredExperience: 429235,
  },
  "75-Slow": {
    level: 75,
    levelingRate: "Slow",
    requiredExperience: 527343,
  },
  "75-Fluctuating": {
    level: 75,
    levelingRate: "Fluctuating",
    requiredExperience: 582187,
  },
  "76-Erratic": {
    level: 76,
    levelingRate: "Erratic",
    requiredExperience: 336255,
  },
  "76-Fast": {
    level: 76,
    levelingRate: "Fast",
    requiredExperience: 351180,
  },
  "76-Medium Fast": {
    level: 76,
    levelingRate: "Medium Fast",
    requiredExperience: 438976,
  },
  "76-Medium Slow": {
    level: 76,
    levelingRate: "Medium Slow",
    requiredExperience: 447591,
  },
  "76-Slow": {
    level: 76,
    levelingRate: "Slow",
    requiredExperience: 548720,
  },
  "76-Fluctuating": {
    level: 76,
    levelingRate: "Fluctuating",
    requiredExperience: 614566,
  },
  "77-Erratic": {
    level: 77,
    levelingRate: "Erratic",
    requiredExperience: 346965,
  },
  "77-Fast": {
    level: 77,
    levelingRate: "Fast",
    requiredExperience: 365226,
  },
  "77-Medium Fast": {
    level: 77,
    levelingRate: "Medium Fast",
    requiredExperience: 456533,
  },
  "77-Medium Slow": {
    level: 77,
    levelingRate: "Medium Slow",
    requiredExperience: 466464,
  },
  "77-Slow": {
    level: 77,
    levelingRate: "Slow",
    requiredExperience: 570666,
  },
  "77-Fluctuating": {
    level: 77,
    levelingRate: "Fluctuating",
    requiredExperience: 639146,
  },
  "78-Erratic": {
    level: 78,
    levelingRate: "Erratic",
    requiredExperience: 357812,
  },
  "78-Fast": {
    level: 78,
    levelingRate: "Fast",
    requiredExperience: 379641,
  },
  "78-Medium Fast": {
    level: 78,
    levelingRate: "Medium Fast",
    requiredExperience: 474552,
  },
  "78-Medium Slow": {
    level: 78,
    levelingRate: "Medium Slow",
    requiredExperience: 485862,
  },
  "78-Slow": {
    level: 78,
    levelingRate: "Slow",
    requiredExperience: 593190,
  },
  "78-Fluctuating": {
    level: 78,
    levelingRate: "Fluctuating",
    requiredExperience: 673863,
  },
  "79-Erratic": {
    level: 79,
    levelingRate: "Erratic",
    requiredExperience: 367807,
  },
  "79-Fast": {
    level: 79,
    levelingRate: "Fast",
    requiredExperience: 394431,
  },
  "79-Medium Fast": {
    level: 79,
    levelingRate: "Medium Fast",
    requiredExperience: 493039,
  },
  "79-Medium Slow": {
    level: 79,
    levelingRate: "Medium Slow",
    requiredExperience: 505791,
  },
  "79-Slow": {
    level: 79,
    levelingRate: "Slow",
    requiredExperience: 616298,
  },
  "79-Fluctuating": {
    level: 79,
    levelingRate: "Fluctuating",
    requiredExperience: 700115,
  },
  "80-Erratic": {
    level: 80,
    levelingRate: "Erratic",
    requiredExperience: 378880,
  },
  "80-Fast": {
    level: 80,
    levelingRate: "Fast",
    requiredExperience: 409600,
  },
  "80-Medium Fast": {
    level: 80,
    levelingRate: "Medium Fast",
    requiredExperience: 512000,
  },
  "80-Medium Slow": {
    level: 80,
    levelingRate: "Medium Slow",
    requiredExperience: 526260,
  },
  "80-Slow": {
    level: 80,
    levelingRate: "Slow",
    requiredExperience: 640000,
  },
  "80-Fluctuating": {
    level: 80,
    levelingRate: "Fluctuating",
    requiredExperience: 737280,
  },
  "81-Erratic": {
    level: 81,
    levelingRate: "Erratic",
    requiredExperience: 390077,
  },
  "81-Fast": {
    level: 81,
    levelingRate: "Fast",
    requiredExperience: 425152,
  },
  "81-Medium Fast": {
    level: 81,
    levelingRate: "Medium Fast",
    requiredExperience: 531441,
  },
  "81-Medium Slow": {
    level: 81,
    levelingRate: "Medium Slow",
    requiredExperience: 547274,
  },
  "81-Slow": {
    level: 81,
    levelingRate: "Slow",
    requiredExperience: 664301,
  },
  "81-Fluctuating": {
    level: 81,
    levelingRate: "Fluctuating",
    requiredExperience: 765275,
  },
  "82-Erratic": {
    level: 82,
    levelingRate: "Erratic",
    requiredExperience: 400293,
  },
  "82-Fast": {
    level: 82,
    levelingRate: "Fast",
    requiredExperience: 441094,
  },
  "82-Medium Fast": {
    level: 82,
    levelingRate: "Medium Fast",
    requiredExperience: 551368,
  },
  "82-Medium Slow": {
    level: 82,
    levelingRate: "Medium Slow",
    requiredExperience: 568841,
  },
  "82-Slow": {
    level: 82,
    levelingRate: "Slow",
    requiredExperience: 689210,
  },
  "82-Fluctuating": {
    level: 82,
    levelingRate: "Fluctuating",
    requiredExperience: 804997,
  },
  "83-Erratic": {
    level: 83,
    levelingRate: "Erratic",
    requiredExperience: 411686,
  },
  "83-Fast": {
    level: 83,
    levelingRate: "Fast",
    requiredExperience: 457429,
  },
  "83-Medium Fast": {
    level: 83,
    levelingRate: "Medium Fast",
    requiredExperience: 571787,
  },
  "83-Medium Slow": {
    level: 83,
    levelingRate: "Medium Slow",
    requiredExperience: 590969,
  },
  "83-Slow": {
    level: 83,
    levelingRate: "Slow",
    requiredExperience: 714733,
  },
  "83-Fluctuating": {
    level: 83,
    levelingRate: "Fluctuating",
    requiredExperience: 834809,
  },
  "84-Erratic": {
    level: 84,
    levelingRate: "Erratic",
    requiredExperience: 423190,
  },
  "84-Fast": {
    level: 84,
    levelingRate: "Fast",
    requiredExperience: 474163,
  },
  "84-Medium Fast": {
    level: 84,
    levelingRate: "Medium Fast",
    requiredExperience: 592704,
  },
  "84-Medium Slow": {
    level: 84,
    levelingRate: "Medium Slow",
    requiredExperience: 613664,
  },
  "84-Slow": {
    level: 84,
    levelingRate: "Slow",
    requiredExperience: 740880,
  },
  "84-Fluctuating": {
    level: 84,
    levelingRate: "Fluctuating",
    requiredExperience: 877201,
  },
  "85-Erratic": {
    level: 85,
    levelingRate: "Erratic",
    requiredExperience: 433572,
  },
  "85-Fast": {
    level: 85,
    levelingRate: "Fast",
    requiredExperience: 491300,
  },
  "85-Medium Fast": {
    level: 85,
    levelingRate: "Medium Fast",
    requiredExperience: 614125,
  },
  "85-Medium Slow": {
    level: 85,
    levelingRate: "Medium Slow",
    requiredExperience: 636935,
  },
  "85-Slow": {
    level: 85,
    levelingRate: "Slow",
    requiredExperience: 767656,
  },
  "85-Fluctuating": {
    level: 85,
    levelingRate: "Fluctuating",
    requiredExperience: 908905,
  },
  "86-Erratic": {
    level: 86,
    levelingRate: "Erratic",
    requiredExperience: 445239,
  },
  "86-Fast": {
    level: 86,
    levelingRate: "Fast",
    requiredExperience: 508844,
  },
  "86-Medium Fast": {
    level: 86,
    levelingRate: "Medium Fast",
    requiredExperience: 636056,
  },
  "86-Medium Slow": {
    level: 86,
    levelingRate: "Medium Slow",
    requiredExperience: 660787,
  },
  "86-Slow": {
    level: 86,
    levelingRate: "Slow",
    requiredExperience: 795070,
  },
  "86-Fluctuating": {
    level: 86,
    levelingRate: "Fluctuating",
    requiredExperience: 954084,
  },
  "87-Erratic": {
    level: 87,
    levelingRate: "Erratic",
    requiredExperience: 457001,
  },
  "87-Fast": {
    level: 87,
    levelingRate: "Fast",
    requiredExperience: 526802,
  },
  "87-Medium Fast": {
    level: 87,
    levelingRate: "Medium Fast",
    requiredExperience: 658503,
  },
  "87-Medium Slow": {
    level: 87,
    levelingRate: "Medium Slow",
    requiredExperience: 685228,
  },
  "87-Slow": {
    level: 87,
    levelingRate: "Slow",
    requiredExperience: 823128,
  },
  "87-Fluctuating": {
    level: 87,
    levelingRate: "Fluctuating",
    requiredExperience: 987754,
  },
  "88-Erratic": {
    level: 88,
    levelingRate: "Erratic",
    requiredExperience: 467489,
  },
  "88-Fast": {
    level: 88,
    levelingRate: "Fast",
    requiredExperience: 545177,
  },
  "88-Medium Fast": {
    level: 88,
    levelingRate: "Medium Fast",
    requiredExperience: 681472,
  },
  "88-Medium Slow": {
    level: 88,
    levelingRate: "Medium Slow",
    requiredExperience: 710266,
  },
  "88-Slow": {
    level: 88,
    levelingRate: "Slow",
    requiredExperience: 851840,
  },
  "88-Fluctuating": {
    level: 88,
    levelingRate: "Fluctuating",
    requiredExperience: 1035837,
  },
  "89-Erratic": {
    level: 89,
    levelingRate: "Erratic",
    requiredExperience: 479378,
  },
  "89-Fast": {
    level: 89,
    levelingRate: "Fast",
    requiredExperience: 563975,
  },
  "89-Medium Fast": {
    level: 89,
    levelingRate: "Medium Fast",
    requiredExperience: 704969,
  },
  "89-Medium Slow": {
    level: 89,
    levelingRate: "Medium Slow",
    requiredExperience: 735907,
  },
  "89-Slow": {
    level: 89,
    levelingRate: "Slow",
    requiredExperience: 881211,
  },
  "89-Fluctuating": {
    level: 89,
    levelingRate: "Fluctuating",
    requiredExperience: 1071552,
  },
  "90-Erratic": {
    level: 90,
    levelingRate: "Erratic",
    requiredExperience: 491346,
  },
  "90-Fast": {
    level: 90,
    levelingRate: "Fast",
    requiredExperience: 583200,
  },
  "90-Medium Fast": {
    level: 90,
    levelingRate: "Medium Fast",
    requiredExperience: 729000,
  },
  "90-Medium Slow": {
    level: 90,
    levelingRate: "Medium Slow",
    requiredExperience: 762160,
  },
  "90-Slow": {
    level: 90,
    levelingRate: "Slow",
    requiredExperience: 911250,
  },
  "90-Fluctuating": {
    level: 90,
    levelingRate: "Fluctuating",
    requiredExperience: 1122660,
  },
  "91-Erratic": {
    level: 91,
    levelingRate: "Erratic",
    requiredExperience: 501878,
  },
  "91-Fast": {
    level: 91,
    levelingRate: "Fast",
    requiredExperience: 602856,
  },
  "91-Medium Fast": {
    level: 91,
    levelingRate: "Medium Fast",
    requiredExperience: 753571,
  },
  "91-Medium Slow": {
    level: 91,
    levelingRate: "Medium Slow",
    requiredExperience: 789030,
  },
  "91-Slow": {
    level: 91,
    levelingRate: "Slow",
    requiredExperience: 941963,
  },
  "91-Fluctuating": {
    level: 91,
    levelingRate: "Fluctuating",
    requiredExperience: 1160499,
  },
  "92-Erratic": {
    level: 92,
    levelingRate: "Erratic",
    requiredExperience: 513934,
  },
  "92-Fast": {
    level: 92,
    levelingRate: "Fast",
    requiredExperience: 622950,
  },
  "92-Medium Fast": {
    level: 92,
    levelingRate: "Medium Fast",
    requiredExperience: 778688,
  },
  "92-Medium Slow": {
    level: 92,
    levelingRate: "Medium Slow",
    requiredExperience: 816525,
  },
  "92-Slow": {
    level: 92,
    levelingRate: "Slow",
    requiredExperience: 973360,
  },
  "92-Fluctuating": {
    level: 92,
    levelingRate: "Fluctuating",
    requiredExperience: 1214753,
  },
  "93-Erratic": {
    level: 93,
    levelingRate: "Erratic",
    requiredExperience: 526049,
  },
  "93-Fast": {
    level: 93,
    levelingRate: "Fast",
    requiredExperience: 643485,
  },
  "93-Medium Fast": {
    level: 93,
    levelingRate: "Medium Fast",
    requiredExperience: 804357,
  },
  "93-Medium Slow": {
    level: 93,
    levelingRate: "Medium Slow",
    requiredExperience: 844653,
  },
  "93-Slow": {
    level: 93,
    levelingRate: "Slow",
    requiredExperience: 1005446,
  },
  "93-Fluctuating": {
    level: 93,
    levelingRate: "Fluctuating",
    requiredExperience: 1254796,
  },
  "94-Erratic": {
    level: 94,
    levelingRate: "Erratic",
    requiredExperience: 536557,
  },
  "94-Fast": {
    level: 94,
    levelingRate: "Fast",
    requiredExperience: 664467,
  },
  "94-Medium Fast": {
    level: 94,
    levelingRate: "Medium Fast",
    requiredExperience: 830584,
  },
  "94-Medium Slow": {
    level: 94,
    levelingRate: "Medium Slow",
    requiredExperience: 873420,
  },
  "94-Slow": {
    level: 94,
    levelingRate: "Slow",
    requiredExperience: 1038230,
  },
  "94-Fluctuating": {
    level: 94,
    levelingRate: "Fluctuating",
    requiredExperience: 1312322,
  },
  "95-Erratic": {
    level: 95,
    levelingRate: "Erratic",
    requiredExperience: 548720,
  },
  "95-Fast": {
    level: 95,
    levelingRate: "Fast",
    requiredExperience: 685900,
  },
  "95-Medium Fast": {
    level: 95,
    levelingRate: "Medium Fast",
    requiredExperience: 857375,
  },
  "95-Medium Slow": {
    level: 95,
    levelingRate: "Medium Slow",
    requiredExperience: 902835,
  },
  "95-Slow": {
    level: 95,
    levelingRate: "Slow",
    requiredExperience: 1071718,
  },
  "95-Fluctuating": {
    level: 95,
    levelingRate: "Fluctuating",
    requiredExperience: 1354652,
  },
  "96-Erratic": {
    level: 96,
    levelingRate: "Erratic",
    requiredExperience: 560922,
  },
  "96-Fast": {
    level: 96,
    levelingRate: "Fast",
    requiredExperience: 707788,
  },
  "96-Medium Fast": {
    level: 96,
    levelingRate: "Medium Fast",
    requiredExperience: 884736,
  },
  "96-Medium Slow": {
    level: 96,
    levelingRate: "Medium Slow",
    requiredExperience: 932903,
  },
  "96-Slow": {
    level: 96,
    levelingRate: "Slow",
    requiredExperience: 1105920,
  },
  "96-Fluctuating": {
    level: 96,
    levelingRate: "Fluctuating",
    requiredExperience: 1415577,
  },
  "97-Erratic": {
    level: 97,
    levelingRate: "Erratic",
    requiredExperience: 571333,
  },
  "97-Fast": {
    level: 97,
    levelingRate: "Fast",
    requiredExperience: 730138,
  },
  "97-Medium Fast": {
    level: 97,
    levelingRate: "Medium Fast",
    requiredExperience: 912673,
  },
  "97-Medium Slow": {
    level: 97,
    levelingRate: "Medium Slow",
    requiredExperience: 963632,
  },
  "97-Slow": {
    level: 97,
    levelingRate: "Slow",
    requiredExperience: 1140841,
  },
  "97-Fluctuating": {
    level: 97,
    levelingRate: "Fluctuating",
    requiredExperience: 1460276,
  },
  "98-Erratic": {
    level: 98,
    levelingRate: "Erratic",
    requiredExperience: 583539,
  },
  "98-Fast": {
    level: 98,
    levelingRate: "Fast",
    requiredExperience: 752953,
  },
  "98-Medium Fast": {
    level: 98,
    levelingRate: "Medium Fast",
    requiredExperience: 941192,
  },
  "98-Medium Slow": {
    level: 98,
    levelingRate: "Medium Slow",
    requiredExperience: 995030,
  },
  "98-Slow": {
    level: 98,
    levelingRate: "Slow",
    requiredExperience: 1176490,
  },
  "98-Fluctuating": {
    level: 98,
    levelingRate: "Fluctuating",
    requiredExperience: 1524731,
  },
  "99-Erratic": {
    level: 99,
    levelingRate: "Erratic",
    requiredExperience: 591882,
  },
  "99-Fast": {
    level: 99,
    levelingRate: "Fast",
    requiredExperience: 776239,
  },
  "99-Medium Fast": {
    level: 99,
    levelingRate: "Medium Fast",
    requiredExperience: 970299,
  },
  "99-Medium Slow": {
    level: 99,
    levelingRate: "Medium Slow",
    requiredExperience: 1027103,
  },
  "99-Slow": {
    level: 99,
    levelingRate: "Slow",
    requiredExperience: 1212873,
  },
  "99-Fluctuating": {
    level: 99,
    levelingRate: "Fluctuating",
    requiredExperience: 1571884,
  },
  "100-Erratic": {
    level: 100,
    levelingRate: "Erratic",
    requiredExperience: 600000,
  },
  "100-Fast": {
    level: 100,
    levelingRate: "Fast",
    requiredExperience: 800000,
  },
  "100-Medium Fast": {
    level: 100,
    levelingRate: "Medium Fast",
    requiredExperience: 1000000,
  },
  "100-Medium Slow": {
    level: 100,
    levelingRate: "Medium Slow",
    requiredExperience: 1059860,
  },
  "100-Slow": {
    level: 100,
    levelingRate: "Slow",
    requiredExperience: 1250000,
  },
  "100-Fluctuating": {
    level: 100,
    levelingRate: "Fluctuating",
    requiredExperience: 1640000,
  },
} as const
