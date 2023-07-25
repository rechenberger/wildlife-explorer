const win: any = typeof window !== "undefined" ? window : {}

type Teampilot = {
  showChat(): void
  hidChat(): void
  sendMessage(message: string): void
}

export const teampilot = win.teampilot as Teampilot
