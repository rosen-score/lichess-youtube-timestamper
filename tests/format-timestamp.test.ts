import { expect, it } from 'vitest'
import { formatTimestamp } from '../src/utils/format-timestamp'

it('formats a timestamp string', () => {
  expect(formatTimestamp(new Date('2000-01-01T00:00:00.000Z'))).toBe('00:00')
  expect(formatTimestamp(new Date('2000-01-01T00:01:00.000Z'))).toBe('01:00')
  expect(formatTimestamp(new Date('2000-01-01T00:10:00.000Z'))).toBe('10:00')
  expect(formatTimestamp(new Date('2000-01-01T01:00:00.000Z'))).toBe('1:00:00')
  expect(formatTimestamp(new Date('2000-01-01T12:34:56.000Z'))).toBe('12:34:56')
})
