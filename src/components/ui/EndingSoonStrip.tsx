import { Link } from 'react-router-dom'
import type { Vehicle } from '../../types'
import { getLiveRemainingMs, getTimeDisplay } from '../../utils/auctionUtils'
import { formatCurrency } from '../../utils/formatUtils'

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

function getEndingSoonVehicles(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.filter((v) => {
    const remaining = getLiveRemainingMs(v)
    return remaining !== null && remaining < TWO_HOURS_MS
  })
}

interface Props {
  vehicles: Vehicle[]
}

export default function EndingSoonStrip({ vehicles }: Props) {
  const endingSoon = getEndingSoonVehicles(vehicles)

  if (endingSoon.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-3">Ending Soon</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {endingSoon.map((v) => (
          <Link
            key={v.id}
            to={`/vehicle/${v.id}`}
            className="flex-shrink-0 w-56 bg-zinc-50 border border-zinc-200 rounded-lg p-3 hover:border-zinc-300 transition-colors"
          >
            <p className="text-sm font-semibold text-zinc-900 truncate">
              {v.year} {v.make} {v.model}
            </p>
            <p className="font-mono text-lg font-semibold text-amber-500 mt-1">
              {formatCurrency(v.bid_count === 0 ? v.starting_bid : v.current_bid)}
            </p>
            <p className="text-xs text-red-600 font-medium mt-1">
              {getTimeDisplay(v)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { getEndingSoonVehicles }
