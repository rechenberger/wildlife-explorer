export function fillWithNulls<T>(arr: T[], length: number) {
  const result: (T | null)[] = [...arr]
  while (result.length < length) {
    result.push(null)
  }
  return result
}
