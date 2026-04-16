import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getAuctionStatus } from '../utils/auctionUtils'
import { formatCurrency } from '../utils/formatUtils'
import type { Vehicle } from '../types'
import VehicleCard from '../components/ui/VehicleCard'
import FilterBar from '../components/ui/FilterBar'
import Pagination from '../components/ui/Pagination'
import EmptyState from '../components/ui/EmptyState'
import EndingSoonStrip, { getEndingSoonVehicles } from '../components/ui/EndingSoonStrip'

const PAGE_SIZE = 20

const STATUS_ORDER = { live: 0, upcoming: 1, ended: 2 } as const

function sortVehicles(vehicles: Vehicle[], sort: string): Vehicle[] {
  return [...vehicles].sort((a, b) => {
    switch (sort) {
      case 'bid_desc':
        return b.current_bid - a.current_bid
      case 'condition_desc':
        return b.condition_grade - a.condition_grade
      case 'ending_soon': {
        const sa = getAuctionStatus(a)
        const sb = getAuctionStatus(b)
        return STATUS_ORDER[sa] - STATUS_ORDER[sb]
      }
      default: // bid_asc
        return a.current_bid - b.current_bid
    }
  })
}

export default function InventoryPage() {
  const { vehicles } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL-synced filter state
  const q = searchParams.get('q') ?? ''
  const make = searchParams.get('make') ?? ''
  const bodyStyle = searchParams.get('body') ?? ''
  const province = searchParams.get('province') ?? ''
  const gradeMin = parseFloat(searchParams.get('grade') ?? '1')
  const sort = searchParams.get('sort') ?? 'bid_asc'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  // Local state for debouncing the search input
  const [searchInput, setSearchInput] = useState(q)

  // Sync searchInput → URL after 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (searchInput) next.set('q', searchInput)
        else next.delete('q')
        next.delete('page')
        return next
      }, { replace: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local input when URL changes externally (e.g. clear all)
  useEffect(() => {
    setSearchInput(q)
  }, [q])

  function setParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    }, { replace: true })
  }

  function setPage(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    }, { replace: true })
  }

  function clearAll() {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }

  // Derive dropdown options from full dataset
  const makes = useMemo(() => [...new Set(vehicles.map((v) => v.make))].sort(), [vehicles])
  const bodyStyles = useMemo(() => [...new Set(vehicles.map((v) => v.body_style))].sort(), [vehicles])
  const provinces = useMemo(() => [...new Set(vehicles.map((v) => v.province))].sort(), [vehicles])

  // Filter vehicles
  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim()
    const results = vehicles.filter((v) => {
      if (needle) {
        const haystack = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.city}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      if (make && v.make !== make) return false
      if (bodyStyle && v.body_style !== bodyStyle) return false
      if (province && v.province !== province) return false
      if (v.condition_grade < gradeMin) return false
      return true
    })
    return sortVehicles(results, sort)
  }, [vehicles, q, make, bodyStyle, province, gradeMin, sort])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageVehicles = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasActiveFilters = q !== '' || make !== '' || bodyStyle !== '' || province !== '' || gradeMin > 1 || sort !== 'bid_asc'

  const liveCount = useMemo(() => vehicles.filter((v) => getAuctionStatus(v) === 'live').length, [vehicles])
  const endingSoonCount = useMemo(() => getEndingSoonVehicles(vehicles).length, [vehicles])
  const totalValue = useMemo(() => vehicles.reduce((sum, v) => sum + (v.bid_count === 0 ? v.starting_bid : v.current_bid), 0), [vehicles])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-500 mb-4">
        <span>{vehicles.length} vehicles</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {liveCount} live
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          {endingSoonCount} ending soon
        </span>
        <span>
          Total value: <span className="font-mono">{formatCurrency(totalValue)}</span>
        </span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Auction Inventory</h1>
      </div>

      {/* Ending Soon strip */}
      <EndingSoonStrip vehicles={vehicles} />

      <FilterBar
        makes={makes}
        bodyStyles={bodyStyles}
        provinces={provinces}
        searchInput={searchInput}
        make={make}
        bodyStyle={bodyStyle}
        province={province}
        gradeMin={gradeMin}
        sort={sort}
        onSearchInputChange={setSearchInput}
        onMakeChange={(v) => setParam('make', v)}
        onBodyStyleChange={(v) => setParam('body', v)}
        onProvinceChange={(v) => setParam('province', v)}
        onGradeMinChange={(v) => setParam('grade', v === 1 ? '' : String(v))}
        onSortChange={(v) => setParam('sort', v === 'bid_asc' ? '' : v)}
        hasActiveFilters={hasActiveFilters}
        onClear={clearAll}
      />

      {filtered.length === 0 ? (
        <EmptyState onReset={clearAll} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}
