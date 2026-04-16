import { describe, it, expect } from 'vitest'
import { formatCurrency, formatOdometer, getConditionLabel, getConditionColor } from './formatUtils'

describe('formatCurrency', () => {
  it('formats whole dollar amounts', () => {
    expect(formatCurrency(5000)).toBe('$5,000')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('formats large amounts', () => {
    expect(formatCurrency(125000)).toBe('$125,000')
  })
})

describe('formatOdometer', () => {
  it('formats with comma separator and km suffix', () => {
    expect(formatOdometer(45000)).toBe('45,000 km')
  })

  it('formats small values', () => {
    expect(formatOdometer(500)).toBe('500 km')
  })
})

describe('getConditionLabel', () => {
  it('returns Excellent for grade >= 4.0', () => {
    expect(getConditionLabel(4.0)).toBe('Excellent')
    expect(getConditionLabel(5.0)).toBe('Excellent')
  })

  it('returns Good for grade >= 3.0 and < 4.0', () => {
    expect(getConditionLabel(3.0)).toBe('Good')
    expect(getConditionLabel(3.9)).toBe('Good')
  })

  it('returns Fair for grade >= 2.0 and < 3.0', () => {
    expect(getConditionLabel(2.0)).toBe('Fair')
    expect(getConditionLabel(2.9)).toBe('Fair')
  })

  it('returns Poor for grade < 2.0', () => {
    expect(getConditionLabel(1.9)).toBe('Poor')
    expect(getConditionLabel(1.0)).toBe('Poor')
  })
})

describe('getConditionColor', () => {
  it('returns green for grade >= 4.0', () => {
    expect(getConditionColor(4.0)).toBe('text-green-500')
  })

  it('returns amber for grade >= 2.5 and < 4.0', () => {
    expect(getConditionColor(2.5)).toBe('text-amber-400')
    expect(getConditionColor(3.9)).toBe('text-amber-400')
  })

  it('returns red for grade < 2.5', () => {
    expect(getConditionColor(2.4)).toBe('text-red-500')
  })
})
