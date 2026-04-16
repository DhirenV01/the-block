import type { Vehicle, AuctionStatus } from '../types'

function hashVehicleId(id: string): number {
  return String(id).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 100
}

export function getAuctionStatus(vehicle: Vehicle): AuctionStatus {
  const hash = hashVehicleId(vehicle.id)
  if (hash < 20) return 'ended'
  if (hash < 50) return 'live'
  return 'upcoming'
}

export function getLiveRemainingMs(vehicle: Vehicle): number | null {
  const status = getAuctionStatus(vehicle)
  if (status !== 'live') return null
  const hash = hashVehicleId(vehicle.id)
  const now = Date.now()
  const virtualStart = now - ((hash - 20) % 60 + 1) * 60000
  const endTime = virtualStart + 2 * 60 * 60 * 1000
  return Math.max(0, endTime - now)
}

export function getTimeDisplay(vehicle: Vehicle): string {
  const status = getAuctionStatus(vehicle)
  const hash = hashVehicleId(vehicle.id)
  const now = Date.now()

  if (status === 'ended') return 'Ended'

  if (status === 'live') {
    const virtualStart = now - ((hash - 20) % 60 + 1) * 60000
    const endTime = virtualStart + 2 * 60 * 60 * 1000
    const remaining = endTime - now
    if (remaining <= 0) return 'Ending soon'
    const hours = Math.floor(remaining / 3600000)
    const mins = Math.floor((remaining % 3600000) / 60000)
    return hours > 0 ? `Ends in ${hours}h ${mins}m` : `Ends in ${mins}m`
  }

  // upcoming
  const virtualStart = now + ((hash - 50) * 28.8 + 1) * 60000
  const timeUntil = virtualStart - now
  const hours = Math.floor(timeUntil / 3600000)
  const mins = Math.floor((timeUntil % 3600000) / 60000)
  return hours > 0 ? `Starts in ${hours}h ${mins}m` : `Starts in ${mins}m`
}
