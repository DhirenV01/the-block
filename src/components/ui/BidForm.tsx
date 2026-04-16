import { useState } from 'react'
import type { Vehicle } from '../../types'
import { useBidState } from '../../hooks/useBidState'
import { getAuctionStatus } from '../../utils/auctionUtils'
import { formatCurrency } from '../../utils/formatUtils'
import { getMinBid, getMinBidIncrement } from '../../utils/bidUtils'

interface Props {
  vehicle: Vehicle
}

export default function BidForm({ vehicle }: Props) {
  const { placeBid } = useBidState()
  const status = getAuctionStatus(vehicle)
  const isEnded = status === 'ended'

  const noBids = vehicle.bid_count === 0
  const defaultBid = noBids
    ? vehicle.starting_bid
    : vehicle.current_bid + getMinBidIncrement(vehicle.current_bid)

  const [bidAmount, setBidAmount] = useState(defaultBid)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBidAmount(Number(e.target.value))
    setError('')
    setSuccess('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEnded) return

    const minRequired = noBids ? vehicle.starting_bid : vehicle.current_bid + getMinBidIncrement(vehicle.current_bid)

    if (bidAmount < minRequired) {
      const label = noBids ? 'starting bid' : 'minimum bid'
      setError(`Bid must be at least ${formatCurrency(minRequired)} (${label})`)
      return
    }

    const result = placeBid(vehicle.id, bidAmount)
    if (result.success) {
      setSuccess('Bid placed successfully!')
      setError('')
      setBidAmount(getMinBid(bidAmount))
    } else {
      setError(result.error ?? 'Failed to place bid')
      setSuccess('')
    }
  }

  if (isEnded) {
    return (
      <div className="mt-4 pt-4 border-t border-zinc-200">
        <p className="text-sm text-zinc-500">Auction has ended</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-zinc-200">
      <label className="block text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">
        Your Bid
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
          <input
            type="number"
            value={bidAmount}
            onChange={handleChange}
            min={defaultBid}
            step={1}
            className="w-full pl-7 pr-3 py-2 border border-zinc-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors"
        >
          Place Bid
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
    </form>
  )
}
