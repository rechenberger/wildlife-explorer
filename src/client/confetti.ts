import JSConfetti from "js-confetti"

export const confetti = (config: { emojis?: string[] } = {}) => {
  const jsConfetti = new JSConfetti()
  jsConfetti.addConfetti(config)
}
