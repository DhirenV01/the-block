import { describe, it, expect } from 'vitest'
import { getMinBidIncrement, getMinBid } from './bidUtils'

describe('getMinBidIncrement', () => {
  it('returns $250 for bids under $10,000', () => {
    expect(getMinBidIncrement(0)).toBe(250)
    expect(getMinBidIncrement(5000)).toBe(250)
    expect(getMinBidIncrement(9999)).toBe(250)
  })

  it('returns $500 for bids $10,000–$24,999', () => {
    expect(getMinBidIncrement(10000)).toBe(500)
    expect(getMinBidIncrement(15000)).toBe(500)
    expect(getMinBidIncrement(24999)).toBe(500)
  })

  it('returns $750 for bids $25,000–$49,999', () => {
    expect(getMinBidIncrement(25000)).toBe(750)
    expect(getMinBidIncrement(35000)).toBe(750)
    expect(getMinBidIncrement(49999)).toBe(750)
  })

  it('returns $1,000 for bids $50,000+', () => {
    expect(getMinBidIncrement(50000)).toBe(1000)
    expect(getMinBidIncrement(100000)).toBe(1000)
  })
})

describe('getMinBid', () => {
  it('adds the correct increment to the current bid', () => {
    expect(getMinBid(5000)).toBe(5250)
    expect(getMinBid(10000)).toBe(10500)
    expect(getMinBid(25000)).toBe(25750)
    expect(getMinBid(50000)).toBe(51000)
  })
})
