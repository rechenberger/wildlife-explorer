import { Protocol } from "@pkmn/protocol"
import { LogFormatter } from "@pkmn/view"

export const parseBattleLog = (
  line?: string | string[] | undefined,
  returnAsHtml: boolean = false
) => {
  const formatter = new LogFormatter("p1")

  const extractMessage = (buf: string) => {
    let out = ""
    for (const line of buf.split("\n")) {
      const { args, kwArgs } = Protocol.parseBattleLine(line)
      out += returnAsHtml
        ? formatter.formatHTML(args, kwArgs)
        : formatter.formatText(args, kwArgs)
    }
    return out
  }
  if (!line) return ""
  if (typeof line === "string") return extractMessage(line)
  if (typeof line === "object") return extractMessage(line.join("\n"))
  return ""
}
