import React, { useState, useEffect } from 'react'
import type { Vehicle } from '../../types'
import { useBidState } from '../../hooks/useBidState'
import { getAuctionStatus } from '../../utils/auctionUtils'
import { formatCurrency } from '../../utils/formatUtils'
import { getMinBid, getMinBidIncrement } from '../../utils/bidUtils'

interface Props {
  vehicle: Vehicle
}

function loadMaxBids(): Record<string, number> {
  try {
    const raw = localStorage.getItem('maxBids')
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function saveMaxBid(vehicleId: string, amount: number): void {
  const maxBids = loadMaxBids()
  maxBids[vehicleId] = amount
  localStorage.setItem('maxBids', JSON.stringify(maxBids))
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
  const [bidMode, setBidMode] = useState<'standard' | 'max'>('standard')
  const [maxBidAmount, setMaxBidAmount] = useState(defaultBid)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [outbidWarning, setOutbidWarning] = useState('')

  // Check on mount whether current_bid exceeds stored max bid (outbid simulation)
  useEffect(() => {
    const maxBids = loadMaxBids()
    const storedMax = maxBids[vehicle.id]
    if (storedMax != null && vehicle.current_bid > storedMax) {
      setOutbidWarning(
        `You were outbid. Current bid (${formatCurrency(vehicle.current_bid)}) exceeded your maximum (${formatCurrency(storedMax)}).`
      )
    }
  }, [vehicle.id, vehicle.current_bid])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBidAmount(Number(e.target.value))
    setError('')
    setSuccess('')
  }

  function handleMaxBidChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMaxBidAmount(Number(e.target.value))
    setError('')
    setSuccess('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEnded) return

    const minRequired = noBids
      ? vehicle.starting_bid
      : vehicle.current_bid + getMinBidIncrement(vehicle.current_bid)

    if (bidMode === 'standard') {
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
    } else {
      // Max / proxy bid
      if (maxBidAmount < minRequired) {
        setError(`Maximum bid must be at least ${formatCurrency(minRequired)}`)
        return
      }
      // Place the minimum valid bid immediately
      const result = placeBid(vehicle.id, minRequired)
      if (result.success) {
        saveMaxBid(vehicle.id, maxBidAmount)
        setOutbidWarning('')
        setSuccess(
          `Bid placed at ${formatCurrency(minRequired)}. Auto-bidding active up to your maximum of ${formatCurrency(maxBidAmount)}.`
        )
        setError('')
        setBidAmount(getMinBid(minRequired))
        setMaxBidAmount(getMinBid(minRequired))
      } else {
        setError(result.error ?? 'Failed to place bid')
        setSuccess('')
      }
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
      {outbidWarning && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{outbidWarning}</p>
        </div>
      )}

      {/* Bid mode toggle */}
      <div className="flex gap-1 mb-3 p-1 bg-zinc-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => { setBidMode('standard'); setError(''); setSuccess('') }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            bidMode === 'standard'
              ? 'bg-white text-zinc-900 border border-zinc-200'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Standard Bid
        </button>
        <button
          type="button"
          onClick={() => { setBidMode('max'); setError(''); setSuccess('') }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            bidMode === 'max'
              ? 'bg-white text-zinc-900 border border-zinc-200'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Max Bid
        </button>
      </div>

      {bidMode === 'standard' ? (
        <>
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
        </>
      ) : (
        <>
          <label className="block text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">
            Your Maximum Bid
          </label>
          <p className="text-xs text-zinc-500 mb-2">
            We'll place the minimum bid now and auto-increment up to your maximum.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="number"
                value={maxBidAmount}
                onChange={handleMaxBidChange}
                min={defaultBid}
                step={1}
                className="w-full pl-7 pr-3 py-2 border border-zinc-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors"
            >
              Set Max
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
    </form>
  )
}
