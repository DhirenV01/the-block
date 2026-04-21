import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getAuctionStatus } from '../utils/auctionUtils'
import { formatCurrency, formatOdometer, getConditionLabel } from '../utils/formatUtils'

function VehiclePlaceholder({ label }: { label: string }) {
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
        {label}
      </text>
    </svg>
  )
}

function SpecRow({
  label,
  valueA,
  valueB,
  highlight,
}: {
  label: string
  valueA: string
  valueB: string
  highlight?: 'none' | 'a-better' | 'b-better'
}) {
  const aCls =
    highlight === 'a-better'
      ? 'text-green-500 font-medium'
      : highlight === 'b-better'
      ? 'text-red-500'
      : 'text-zinc-900'
  const bCls =
    highlight === 'b-better'
      ? 'text-green-500 font-medium'
      : highlight === 'a-better'
      ? 'text-red-500'
      : 'text-zinc-900'

  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-zinc-100 last:border-0">
      <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium self-center">
        {label}
      </span>
      <span className={`text-sm ${aCls}`}>{valueA}</span>
      <span className={`text-sm ${bCls}`}>{valueB}</span>
    </div>
  )
}

export default function ComparePage() {
  const { vehicles, bids, compareList, clearCompare } = useApp()
  const navigate = useNavigate()

  const compared = compareList
    .map((id) => vehicles.find((v) => v.id === id))
    .filter(Boolean) as NonNullable<(typeof vehicles)[0]>[]

  const vA = compared[0]
  const vB = compared[1]

  function handleClear() {
    clearCompare()
    navigate('/')
  }

  if (compared.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-500 mb-4">No vehicles selected for comparison.</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-amber-500 hover:underline"
        >
          Browse inventory
        </button>
      </div>
    )
  }

  function getBid(v: typeof vA) {
    const storedBid = bids[v.id]
    return storedBid ? storedBid.amount : v.bid_count === 0 ? v.starting_bid : v.current_bid
  }

  const bidA = vA ? getBid(vA) : 0
  const bidB = vB ? getBid(vB) : 0

  function conditionHighlight(a: number, b: number): 'a-better' | 'b-better' | 'none' {
    if (a === b) return 'none'
    return a > b ? 'a-better' : 'b-better'
  }

  function bidHighlight(a: number, b: number): 'a-better' | 'b-better' | 'none' {
    if (a === b) return 'none'
    // lower bid = better for buyer
    return a < b ? 'a-better' : 'b-better'
  }

  function conditionDotClass(grade: number): string {
    if (grade >= 4.0) return 'bg-green-500'
    if (grade >= 2.5) return 'bg-amber-400'
    return 'bg-red-500'
  }

  function conditionTextClass(grade: number): string {
    if (grade >= 4.0) return 'text-green-500'
    if (grade >= 2.5) return 'text-amber-400'
    return 'text-red-500'
  }

  function renderColumn(v: typeof vA, bid: number, bidOther: number, gradeOther: number) {
    if (!v) return null
    const status = getAuctionStatus(v)
    const imgSrc = v.images[0]
    const usePlaceholder = !imgSrc || imgSrc.includes('placehold.co')
    const label = `${v.year} ${v.make} ${v.model}`
    const bidLabel = v.bid_count === 0 ? 'Starting Bid' : 'Current Bid'
    const bidHighlightCls =
      bid < bidOther ? 'text-green-500' : bid > bidOther ? 'text-red-500' : 'text-zinc-900'
    const gradeHighlightCls =
      v.condition_grade > gradeOther
        ? 'text-green-500'
        : v.condition_grade < gradeOther
        ? 'text-red-500'
        : conditionTextClass(v.condition_grade)

    return (
      <div className="flex-1 min-w-0">
        {/* Image */}
        <div className="aspect-video rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
          {usePlaceholder ? (
            <VehiclePlaceholder label={label} />
          ) : (
            <img
              src={imgSrc}
              alt={label}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Header */}
        <div className="mt-3">
          <h2 className="font-semibold text-zinc-900 text-lg leading-snug">{label}</h2>
          {v.trim && <p className="text-sm text-zinc-500 mt-0.5">{v.trim}</p>}
          <span
            className="inline-block mt-1 text-xs px-2 py-0.5 rounded font-medium"
            style={{
              backgroundColor:
                status === 'live'
                  ? '#dcfce7'
                  : status === 'upcoming'
                  ? '#fef9c3'
                  : '#f4f4f5',
              color:
                status === 'live'
                  ? '#15803d'
                  : status === 'upcoming'
                  ? '#a16207'
                  : '#71717a',
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Condition */}
        <div className="mt-4 flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${conditionDotClass(v.condition_grade)}`} />
          <span className={`font-mono text-base font-semibold ${gradeHighlightCls}`}>
            {v.condition_grade.toFixed(1)}
          </span>
          <span className="text-sm text-zinc-500">{getConditionLabel(v.condition_grade)}</span>
        </div>

        {/* Bid */}
        <div className="mt-3">
          <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">{bidLabel}</p>
          <p className={`font-mono text-2xl font-semibold mt-0.5 ${bidHighlightCls}`}>
            {formatCurrency(bid)}
          </p>
        </div>

        {/* Damage notes */}
        {v.damage_notes.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Damage Notes</p>
            <ul className="space-y-1">
              {v.damage_notes.map((note, i) => (
                <li key={i} className="text-sm text-red-500 flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Compare Vehicles</h1>
        <button
          onClick={handleClear}
          className="text-sm text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          Clear &amp; return to inventory
        </button>
      </div>

      {/* Side-by-side columns */}
      <div className="flex gap-8">
        {renderColumn(vA, bidA, bidB, vB?.condition_grade ?? 0)}
        {vB && renderColumn(vB, bidB, bidA, vA?.condition_grade ?? 0)}
      </div>

      {/* Specs comparison table */}
      {vA && vB && (
        <div className="mt-8 bg-zinc-50 border border-zinc-200 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 pb-2 border-b border-zinc-200 mb-1">
            <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Spec</span>
            <span className="text-xs font-medium text-zinc-900 truncate">
              {vA.year} {vA.make} {vA.model}
            </span>
            <span className="text-xs font-medium text-zinc-900 truncate">
              {vB.year} {vB.make} {vB.model}
            </span>
          </div>

          <SpecRow
            label="Condition"
            valueA={`${vA.condition_grade.toFixed(1)} — ${getConditionLabel(vA.condition_grade)}`}
            valueB={`${vB.condition_grade.toFixed(1)} — ${getConditionLabel(vB.condition_grade)}`}
            highlight={conditionHighlight(vA.condition_grade, vB.condition_grade)}
          />
          <SpecRow
            label="Bid"
            valueA={formatCurrency(bidA)}
            valueB={formatCurrency(bidB)}
            highlight={bidHighlight(bidA, bidB)}
          />
          <SpecRow
            label="Engine"
            valueA={vA.engine}
            valueB={vB.engine}
          />
          <SpecRow
            label="Transmission"
            valueA={vA.transmission}
            valueB={vB.transmission}
          />
          <SpecRow
            label="Drivetrain"
            valueA={vA.drivetrain}
            valueB={vB.drivetrain}
          />
          <SpecRow
            label="Odometer"
            valueA={formatOdometer(vA.odometer_km)}
            valueB={formatOdometer(vB.odometer_km)}
          />
          <SpecRow
            label="Title"
            valueA={vA.title_status}
            valueB={vB.title_status}
          />
          <SpecRow
            label="Province"
            valueA={`${vA.city}, ${vA.province}`}
            valueB={`${vB.city}, ${vB.province}`}
          />
        </div>
      )}
    </div>
  )
}
