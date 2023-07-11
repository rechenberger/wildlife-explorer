import * as fs from "fs"
import * as readline from "readline"
interface PokemonLevelTypeObj {
  num?: number
  levelTypeString?: string
  levelTypeMapped?: number
}

const levelTypeMap = {
  "Medium Fast": 1,
  Erratic: 2,
  Fluctuating: 3,
  "Medium Slow": 4,
  Fast: 5,
  Slow: 6,
}

const mapLevelType = (str: string | undefined) => {
  if (!str) return 0
  const num = levelTypeMap[str]
  return isNaN(num) ? 0 : num
}

const safeParseInt = (str: string | undefined) => {
  if (!str) return 0
  const num = parseInt(str)
  return isNaN(num) ? 0 : num
}

async function processLineByLine() {
  const fileStream = fs.createReadStream("pokemonLevelTypeRaw.txt")

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  let data: PokemonLevelTypeObj[] = []

  for await (const line of rl) {
    let splitLine = line.split("|")
    let obj: PokemonLevelTypeObj = {
      num: safeParseInt(splitLine[0]),
      levelTypeString: splitLine[1],
      levelTypeMapped: mapLevelType(splitLine[1]),
    }
    data.push(obj)
  }

  fs.writeFile(
    "outputPokemonLevelType.json",
    JSON.stringify(data, null, 2),
    (err: any) => {
      if (err) throw err
      console.log("Data written to file")
    }
  )
}

processLineByLine()
