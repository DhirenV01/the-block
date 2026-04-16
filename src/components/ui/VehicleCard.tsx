import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Vehicle } from '../../types'
import { useApp } from '../../context/AppContext'
import { getAuctionStatus, getTimeDisplay } from '../../utils/auctionUtils'
import { formatCurrency } from '../../utils/formatUtils'
import AuctionStatusPill from './AuctionStatusPill'
import ConditionBadge from './ConditionBadge'

interface Props {
  vehicle: Vehicle
}

function VehiclePlaceholder({ vehicle }: { vehicle: Vehicle }) {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="450" fill="#f4f4f5" />
      <text
        x="400"
        y="225"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#a1a1aa"
        fontSize="22"
        fontFamily="system-ui, sans-serif"
      >
        {vehicle.year} {vehicle.make} {vehicle.model}
      </text>
    </svg>
  )
}

export default function VehicleCard({ vehicle }: Props) {
  const { watchlist, toggleWatchlist, compareList, addToCompare, removeFromCompare } = useApp()
  const [imgFailed, setImgFailed] = useState(false)
  const status = getAuctionStatus(vehicle)
  const timeDisplay = getTimeDisplay(vehicle)
  const isWatchlisted = watchlist.includes(vehicle.id)
  const isCompared = compareList.includes(vehicle.id)
  const canCompare = isCompared || compareList.length < 2

  const src = vehicle.images[0]
  const usePlaceholder = imgFailed || src?.includes('placehold.co')

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors overflow-hidden flex flex-col">
      {/* Image */}
      <Link to={`/vehicle/${vehicle.id}`} className="relative block aspect-video overflow-hidden bg-zinc-100">
        {usePlaceholder ? (
          <VehiclePlaceholder vehicle={vehicle} />
        ) : (
          <img
            src={src}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
        <div className="absolute top-2 left-2">
          <AuctionStatusPill status={status} />
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggleWatchlist(vehicle.id) }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
          aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Heart
            size={16}
            className={isWatchlisted ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}
          />
        </button>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/vehicle/${vehicle.id}`} className="block">
          <h3 className="font-semibold text-zinc-900 text-base leading-snug">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-zinc-500 mt-0.5">{vehicle.trim}</p>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-xs text-zinc-400">{vehicle.lot}</span>
          <span className="text-xs text-zinc-500">{vehicle.city}, {vehicle.province}</span>
        </div>

        <div className="flex items-end justify-between mt-3 flex-1">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">
              {vehicle.bid_count === 0 ? 'Starting Bid' : 'Current Bid'}
            </p>
            <p className="font-mono text-xl font-semibold text-zinc-900">
              {formatCurrency(vehicle.bid_count === 0 ? vehicle.starting_bid : vehicle.current_bid)}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {vehicle.bid_count} bid{vehicle.bid_count !== 1 ? 's' : ''} · {timeDisplay}
            </p>
          </div>
          <ConditionBadge grade={vehicle.condition_grade} />
        </div>

        {vehicle.buy_now_price != null && (
          <div className="mt-2">
            <span className="inline-block text-xs font-medium uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
              Buy Now Available
            </span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-zinc-200">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCompared}
              disabled={!canCompare}
              onChange={() => isCompared ? removeFromCompare(vehicle.id) : addToCompare(vehicle.id)}
              className="accent-amber-400 disabled:opacity-40"
            />
            <span className="text-xs text-zinc-500">Compare</span>
          </label>
        </div>
      </div>
    </div>
  )
}
