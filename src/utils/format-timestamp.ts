export function formatTimestamp(timestamp: Date): string {
  return timestamp
    .toISOString()
    .substring(11, 19)
    .replace(/^0+:?/, '')
}
