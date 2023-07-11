import * as fs from "fs"

import * as readline from "readline"

interface EffortValueYieldObj {
  num?: number
  name?: string
  baseExp?: number
  hp?: number
  atk?: number
  def?: number
  spAtk?: number
  spDef?: number
  speed?: number
  totalEvs?: number
  form?: string
  formName?: string
}

const safeParseInt = (str: string | undefined) => {
  if (!str) return 0
  const num = parseInt(str)
  return isNaN(num) ? 0 : num
}

async function processLineByLine() {
  const fileStream = fs.createReadStream("pokemonEffortValueYieldRaw.txt")

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  let data: EffortValueYieldObj[] = []

  for await (const line of rl) {
    let splitLine = line.split(",")
    let obj: EffortValueYieldObj = {
      num: safeParseInt(splitLine[0]),
      name: splitLine[1],
      baseExp: safeParseInt(splitLine[2]),
      hp: safeParseInt(splitLine[3]),
      atk: safeParseInt(splitLine[4]),
      def: safeParseInt(splitLine[5]),
      spAtk: safeParseInt(splitLine[6]),
      spDef: safeParseInt(splitLine[7]),
      speed: safeParseInt(splitLine[8]),
      // sum the values of splitLine[3] through splitLine[8]
      totalEvs: splitLine
        .slice(3, 9)
        .map((ev) => parseInt(ev))
        .reduce((a, b) => a + b),
    }
    if (splitLine[9]) {
      let formSplit = splitLine[9].split("=") as [string, string]
      obj["form"] = formSplit[1]
      obj["formName"] = splitLine[10]
    }
    data.push(obj)
  }

  fs.writeFile("output.json", JSON.stringify(data, null, 2), (err: any) => {
    if (err) throw err
    console.log("Data written to file")
  })
}

processLineByLine()
