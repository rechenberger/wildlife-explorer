import * as fs from "fs"
import * as readline from "readline"
interface PokemonLevelingRateObj {
  num?: number
  levelingRate?: string
}

const safeParseInt = (str: string | undefined) => {
  if (!str) return 0
  const num = parseInt(str)
  return isNaN(num) ? 0 : num
}

async function processLineByLine() {
  const fileStream = fs.createReadStream("pokemonLevelingRateRaw.txt")

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  let data: { [key: number]: PokemonLevelingRateObj } = {}

  for await (const line of rl) {
    let splitLine = line.split("|")
    let obj: PokemonLevelingRateObj = {
      num: safeParseInt(splitLine[0]),
      levelingRate: splitLine[1],
    }
    data[obj.num] = obj
  }

  fs.writeFile(
    "outputPokemonLevelingRate.json",
    JSON.stringify(data, null, 2),
    (err: any) => {
      if (err) throw err
      console.log("Data written to file")
    }
  )
}

processLineByLine()
