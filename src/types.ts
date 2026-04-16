export type AuctionStatus = 'live' | 'upcoming' | 'ended'

export interface Vehicle {
  id: string
  vin: string
  lot: string
  year: number
  make: string
  model: string
  trim: string
  body_style: string
  exterior_color: string
  interior_color: string
  engine: string
  transmission: string
  drivetrain: string
  fuel_type: string
  odometer_km: number
  condition_grade: number
  condition_report: string
  condition_summary?: string
  damage_notes: string[]
  title_status: string
  province: string
  city: string
  auction_start: string
  starting_bid: number
  reserve_price: number | null
  buy_now_price: number | null
  current_bid: number
  bid_count: number
  selling_dealership: string
  images: string[]
}

export interface Bid {
  amount: number
  timestamp: number
  isWinning: boolean
}

export interface AppContextType {
  vehicles: Vehicle[]
  bids: Record<string, Bid>
  watchlist: string[]
  compareList: string[]
  placeBid: (vehicleId: string, amount: number) => { success: boolean; error?: string }
  toggleWatchlist: (vehicleId: string) => void
  addToCompare: (vehicleId: string) => void
  removeFromCompare: (vehicleId: string) => void
  clearCompare: () => void
}
