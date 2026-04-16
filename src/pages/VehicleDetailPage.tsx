import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getAuctionStatus, getTimeDisplay } from '../utils/auctionUtils'
import { formatCurrency, formatOdometer, getConditionLabel, getConditionColor } from '../utils/formatUtils'
import AuctionStatusPill from '../components/ui/AuctionStatusPill'
import ImageGallery from '../components/ui/ImageGallery'
import BidForm from '../components/ui/BidForm'
import BuyerIntelligenceCard from '../components/ui/BuyerIntelligenceCard'

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { vehicles } = useApp()

  const vehicle = vehicles.find((v) => v.id === id)

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Vehicle not found</h1>
        <p className="text-zinc-500 mt-2">The vehicle you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-amber-600 hover:text-amber-700 font-medium text-sm"
        >
          Back to inventory
        </button>
      </div>
    )
  }

  const status = getAuctionStatus(vehicle)
  const timeDisplay = getTimeDisplay(vehicle)
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  // Ending soon: live + time display shows only minutes (no "h")
  const isEndingSoon = status === 'live' && timeDisplay.includes('m') && !timeDisplay.includes('h')

  // Reserve status
  let reserveText: string
  let reserveColor: string
  if (vehicle.reserve_price === null) {
    reserveText = 'No Reserve'
    reserveColor = 'text-zinc-500'
  } else if (vehicle.current_bid >= vehicle.reserve_price) {
    reserveText = 'Reserve Met'
    reserveColor = 'text-green-500'
  } else {
    reserveText = 'Reserve Not Met'
    reserveColor = 'text-zinc-500'
  }

  // Condition dot color (bg variant)
  let conditionDotBg: string
  if (vehicle.condition_grade >= 4.0) conditionDotBg = 'bg-green-500'
  else if (vehicle.condition_grade >= 2.5) conditionDotBg = 'bg-amber-400'
  else conditionDotBg = 'bg-red-500'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Back to inventory
      </button>

      {/* Title — mobile only */}
      <h1 className="text-2xl font-semibold text-zinc-900 lg:hidden mb-4">
        {title}
        {vehicle.trim && <span className="text-zinc-500 font-normal"> {vehicle.trim}</span>}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image Gallery */}
          <ImageGallery images={vehicle.images} alt={title} />

          {/* Title — desktop only */}
          <div className="hidden lg:block">
            <h1 className="text-2xl font-semibold text-zinc-900">
              {title}
              {vehicle.trim && <span className="text-zinc-500 font-normal"> {vehicle.trim}</span>}
            </h1>
            <p className="text-sm text-zinc-400 font-mono mt-1">Lot {vehicle.lot}</p>
          </div>

          {/* Mobile: Auction Panel */}
          <div className="lg:hidden">
            <AuctionPanel
              vehicle={vehicle}
              status={status}
              timeDisplay={timeDisplay}
              isEndingSoon={isEndingSoon}
              reserveText={reserveText}
              reserveColor={reserveColor}
            />
          </div>

          {/* Vehicle Specs */}
          <section className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
            <h2 className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-3">Specifications</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <SpecRow label="Engine" value={vehicle.engine} />
              <SpecRow label="Transmission" value={vehicle.transmission} />
              <SpecRow label="Drivetrain" value={vehicle.drivetrain} />
              <SpecRow label="Fuel Type" value={vehicle.fuel_type} />
              <SpecRow label="Odometer" value={formatOdometer(vehicle.odometer_km)} mono />
              <SpecRow label="VIN" value={vehicle.vin} mono />
              <SpecRow label="Exterior" value={vehicle.exterior_color} />
              <SpecRow label="Interior" value={vehicle.interior_color} />
              <SpecRow label="Body Style" value={vehicle.body_style} />
            </div>
          </section>

          {/* Condition Section */}
          <section className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
            <h2 className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-3">Condition</h2>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-3xl font-semibold text-zinc-900">
                {vehicle.condition_grade.toFixed(1)}
              </span>
              <span className={`w-3 h-3 rounded-full ${conditionDotBg}`} />
              <span className={`text-sm font-medium ${getConditionColor(vehicle.condition_grade)}`}>
                {getConditionLabel(vehicle.condition_grade)}
              </span>
            </div>
            {vehicle.condition_report && (
              <p className="text-sm text-zinc-600 mb-3">{vehicle.condition_report}</p>
            )}
            {vehicle.damage_notes.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1.5">Damage Notes</h3>
                <ul className="space-y-1">
                  {vehicle.damage_notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                  vehicle.title_status === 'Clean' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {vehicle.title_status === 'Clean' ? 'Clean Title' : 'Salvage'}
              </span>
            </div>
          </section>

          {/* Buyer Intelligence */}
          <BuyerIntelligenceCard vehicle={vehicle} />

          {/* Dealership Card */}
          <section className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
            <h2 className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-2">Selling Dealership</h2>
            <p className="text-sm font-medium text-zinc-900">{vehicle.selling_dealership}</p>
            <p className="text-sm text-zinc-500">{vehicle.city}, {vehicle.province}</p>
          </section>
        </div>

        {/* RIGHT COLUMN — desktop only */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="lg:sticky lg:top-20">
            <AuctionPanel
              vehicle={vehicle}
              status={status}
              timeDisplay={timeDisplay}
              isEndingSoon={isEndingSoon}
              reserveText={reserveText}
              reserveColor={reserveColor}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-1 border-b border-zinc-100">
      <span className="text-zinc-500">{label}</span>
      <span className={`text-zinc-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

interface AuctionPanelProps {
  vehicle: import('../types').Vehicle
  status: import('../types').AuctionStatus
  timeDisplay: string
  isEndingSoon: boolean
  reserveText: string
  reserveColor: string
}

function AuctionPanel({ vehicle, status, timeDisplay, isEndingSoon, reserveText, reserveColor }: AuctionPanelProps) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <AuctionStatusPill status={status} />
        {isEndingSoon && (
          <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
            Ending Soon
          </span>
        )}
      </div>

      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">
          {vehicle.bid_count === 0 ? 'Starting Bid' : 'Current Bid'}
        </p>
        <p className="font-mono text-3xl font-semibold text-zinc-900">
          {formatCurrency(vehicle.bid_count === 0 ? vehicle.starting_bid : vehicle.current_bid)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-zinc-500">
            {vehicle.bid_count} bid{vehicle.bid_count !== 1 ? 's' : ''}
          </span>
          <span className="text-zinc-300">·</span>
          <span className={`text-sm font-medium ${reserveColor}`}>{reserveText}</span>
        </div>
      </div>

      <p className="text-sm text-zinc-500">{timeDisplay}</p>

      {vehicle.buy_now_price != null && status !== 'ended' && (
        <button className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors">
          Buy Now — {formatCurrency(vehicle.buy_now_price)}
        </button>
      )}

      <BidForm vehicle={vehicle} />
    </div>
  )
}
