type Teampilot = {
  showChat(): void
  hidChat(): void
  sendMessage(message: string): void
}

export const teampilot = () => {
  const win: any = typeof window !== "undefined" ? window : null
  if (!win) throw new Error("window is not defined")
  return win.teampilot as Teampilot
}
