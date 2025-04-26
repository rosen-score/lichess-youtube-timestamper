export function formatTimestamp(timestamp: Date): string {
  return timestamp.toISOString().substring(11, 19).replace(/^0+:?/, '')
}

export function formatChapterName(name: string | undefined): string {
  return name || '(No game)'
}

export function renameOpeningStaffordGambit(chapter: string): string {
  if (chapter.includes('Stafford Gambit')) {
    return 'STAFFORD GAMBIT'
  }

  return chapter
}

export function getGameIdFromUrl(url: string): string {
  url = url.replace(/\/(white|black)$/, '')
  const regex = /lichess\.org\/([a-zA-Z0-9]{8,12})\/?/
  const match = url.match(regex)
  if (match) {
    return match[1].substring(0, 8)
  }
  throw new Error('Invalid URL format')
}
