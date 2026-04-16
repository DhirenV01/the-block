import type { Bid } from '../types'
import { useApp } from '../context/AppContext'

export function useBidState(): {
  bids: Record<string, Bid>
  placeBid: (vehicleId: string, amount: number) => { success: boolean; error?: string }
  getBidForVehicle: (vehicleId: string) => Bid | null
} {
  const { bids, placeBid } = useApp()

  function getBidForVehicle(vehicleId: string): Bid | null {
    return bids[vehicleId] ?? null
  }

  return { bids, placeBid, getBidForVehicle }
}
