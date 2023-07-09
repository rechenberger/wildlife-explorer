import { Protocol } from "@pkmn/protocol"
import { LogFormatter } from "@pkmn/view"

export const parseBattleLog = (line?: string | string[] | undefined) => {
  const xy = new LogFormatter()

  const extractMessage = (buf: string) => {
    let out = ""
    for (const line of buf.split("\n")) {
      const { args, kwArgs } = Protocol.parseBattleLine(line)
      out += xy.formatText(args, kwArgs)
    }
    return out
  }
  if (!line) return ""
  if (typeof line === "string") return extractMessage(line)
  if (typeof line === "object") return extractMessage(line.join("\n"))
  return ""
}
