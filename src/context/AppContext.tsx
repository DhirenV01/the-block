import React, { createContext, useContext, useState } from 'react'
import type { Vehicle, Bid, AppContextType } from '../types'
import vehiclesData from '../../data/vehicles.json'

export const AppContext = createContext<AppContextType | null>(null)

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function initVehicles(bids: Record<string, Bid>): Vehicle[] {
  return (vehiclesData as Vehicle[]).map((vehicle) => {
    const bid = bids[vehicle.id]
    if (bid) {
      return { ...vehicle, current_bid: bid.amount }
    }
    return { ...vehicle }
  })
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bids, setBids] = useState<Record<string, Bid>>(() => loadFromStorage<Record<string, Bid>>('bids', {}))
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const storedBids = loadFromStorage<Record<string, Bid>>('bids', {})
    return initVehicles(storedBids)
  })
  const [watchlist, setWatchlist] = useState<string[]>(() => loadFromStorage<string[]>('watchlist', []))
  const [compareList, setCompareList] = useState<string[]>([])

  function placeBid(vehicleId: string, amount: number): { success: boolean; error?: string } {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return { success: false, error: 'Vehicle not found' }

    const currentBid = vehicle.current_bid ?? vehicle.starting_bid ?? 0
    if (amount <= currentBid) {
      return { success: false, error: 'Bid must be higher than current bid' }
    }

    const isWinning = vehicle.reserve_price != null
      ? amount >= vehicle.reserve_price
      : true

    const newBidEntry: Bid = {
      amount,
      timestamp: Date.now(),
      isWinning,
    }

    const updatedBids = { ...bids, [vehicleId]: newBidEntry }
    setBids(updatedBids)
    localStorage.setItem('bids', JSON.stringify(updatedBids))

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v
        return {
          ...v,
          current_bid: amount,
          bid_count: (v.bid_count ?? 0) + 1,
        }
      })
    )

    return { success: true }
  }

  function toggleWatchlist(vehicleId: string): void {
    setWatchlist((prev) => {
      const updated = prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
      localStorage.setItem('watchlist', JSON.stringify(updated))
      return updated
    })
  }

  function addToCompare(vehicleId: string): void {
    setCompareList((prev) => {
      if (prev.includes(vehicleId) || prev.length >= 2) return prev
      return [...prev, vehicleId]
    })
  }

  function removeFromCompare(vehicleId: string): void {
    setCompareList((prev) => prev.filter((id) => id !== vehicleId))
  }

  function clearCompare(): void {
    setCompareList([])
  }

  const value: AppContextType = {
    vehicles,
    bids,
    watchlist,
    compareList,
    placeBid,
    toggleWatchlist,
    addToCompare,
    removeFromCompare,
    clearCompare,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
