import * as fs from "fs"
import * as readline from "readline"
interface PokemonLevelExperienceMapObj {
  level?: number
  levelingRate?: string
  requiredExperience?: number
}

const safeParseInt = (str: string | undefined) => {
  if (!str) return 0
  const num = parseInt(str.replace(/,/g, ""))
  return isNaN(num) ? 0 : num
}

async function processLineByLine() {
  const fileStream = fs.createReadStream("pokemonLevelExperienceMapRaw.txt")

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  let data: { [key: string]: PokemonLevelExperienceMapObj } = {}

  for await (const line of rl) {
    let splitLine = line.split("|")
    let obj: PokemonLevelExperienceMapObj = {
      level: safeParseInt(splitLine[0]),
      levelingRate: splitLine[1],
      requiredExperience: safeParseInt(splitLine[2]),
    }
    data[`${obj.level}-${obj.levelingRate}`] = obj
  }

  fs.writeFile(
    "outputPokemonLevelExperienceMap.json",
    JSON.stringify(data, null, 2),
    (err: any) => {
      if (err) throw err
      console.log("Data written to file")
    }
  )
}

processLineByLine()
