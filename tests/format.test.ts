import { expect, it } from 'vitest'
import { formatChapterName, formatTimestamp, getGameIdFromUrl, renameOpeningStaffordGambit } from '../src/utils/format'

it('formats a timestamp string', () => {
  expect(formatTimestamp(new Date('2000-01-01T00:00:00.000Z'))).toBe('00:00')
  expect(formatTimestamp(new Date('2000-01-01T00:01:00.000Z'))).toBe('01:00')
  expect(formatTimestamp(new Date('2000-01-01T00:10:00.000Z'))).toBe('10:00')
  expect(formatTimestamp(new Date('2000-01-01T01:00:00.000Z'))).toBe('1:00:00')
  expect(formatTimestamp(new Date('2000-01-01T12:34:56.000Z'))).toBe('12:34:56')
})

it('formats chapter names for games', () => {
  expect(formatChapterName("Queen's Pawn Game")).toBe("Queen's Pawn Game")

  // When a game is aborted, the Opening is empty
  expect(formatChapterName('')).toBe('(No game)')

  expect(formatChapterName(undefined)).toBe('(No game)')
})

it('renames stafford gambit chapters', () => {
  expect(renameOpeningStaffordGambit('Russian Game: Stafford Gambit')).toBe('STAFFORD GAMBIT')

  expect(renameOpeningStaffordGambit('Russian Game: Three Knights Game')).toBe('Russian Game: Three Knights Game')
})

it('gets game ID from URL', () => {
  expect(getGameIdFromUrl('https://lichess.org/45qeL6U8')).toBe('45qeL6U8')
  expect(getGameIdFromUrl('https://lichess.org/45qeL6U8/white')).toBe('45qeL6U8')
  expect(getGameIdFromUrl('https://lichess.org/45qeL6U8/black')).toBe('45qeL6U8')

  expect(getGameIdFromUrl('https://lichess.org/45qeL6U8XXXX')).toBe('45qeL6U8')
})
