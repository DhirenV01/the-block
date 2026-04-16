import { describe, it, expect } from 'vitest'
import { getAuctionStatus } from './auctionUtils'
import type { Vehicle } from '../types'

function makeVehicle(id: string): Vehicle {
  return {
    id,
    vin: 'TEST123',
    lot: 'LOT001',
    year: 2022,
    make: 'Toyota',
    model: 'Camry',
    trim: 'SE',
    body_style: 'Sedan',
    exterior_color: 'Black',
    interior_color: 'Black',
    engine: '2.5L I4',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    fuel_type: 'Gasoline',
    odometer_km: 50000,
    condition_grade: 4.0,
    condition_report: 'Good condition',
    damage_notes: [],
    title_status: 'Clean',
    province: 'ON',
    city: 'Toronto',
    auction_start: '2025-01-01T00:00:00Z',
    starting_bid: 10000,
    reserve_price: null,
    buy_now_price: null,
    current_bid: 10000,
    bid_count: 0,
    selling_dealership: 'Test Dealer',
    images: [],
  }
}

describe('getAuctionStatus', () => {
  it('returns a valid auction status', () => {
    const vehicle = makeVehicle('test-1')
    const status = getAuctionStatus(vehicle)
    expect(['live', 'upcoming', 'ended']).toContain(status)
  })

  it('is deterministic — same vehicle ID always returns the same status', () => {
    const vehicle = makeVehicle('stable-id-123')
    const first = getAuctionStatus(vehicle)
    const second = getAuctionStatus(vehicle)
    const third = getAuctionStatus(vehicle)
    expect(first).toBe(second)
    expect(second).toBe(third)
  })

  it('can produce all three statuses with different IDs', () => {
    const statuses = new Set<string>()
    // Try enough IDs to hit all three statuses
    for (let i = 0; i < 200; i++) {
      statuses.add(getAuctionStatus(makeVehicle(`v-${i}`)))
    }
    expect(statuses.has('live')).toBe(true)
    expect(statuses.has('upcoming')).toBe(true)
    expect(statuses.has('ended')).toBe(true)
  })
})
