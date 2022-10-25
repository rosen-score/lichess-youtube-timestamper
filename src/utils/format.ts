export function formatTimestamp(timestamp: Date): string {
  return timestamp.toISOString().substring(11, 19).replace(/^0+:?/, '')
}

export function formatChapterName(name: string): string {
  return name || '(No game)'
}
