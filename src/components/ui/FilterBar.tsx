import { X } from 'lucide-react'

interface Props {
  // Dynamic options
  makes: string[]
  bodyStyles: string[]
  provinces: string[]
  // Current values
  searchInput: string
  make: string
  bodyStyle: string
  province: string
  gradeMin: number
  sort: string
  // Callbacks
  onSearchInputChange: (v: string) => void
  onMakeChange: (v: string) => void
  onBodyStyleChange: (v: string) => void
  onProvinceChange: (v: string) => void
  onGradeMinChange: (v: number) => void
  onSortChange: (v: string) => void
  // Clear
  hasActiveFilters: boolean
  onClear: () => void
}

const selectClass =
  'border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-700 bg-white hover:border-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors'

export default function FilterBar({
  makes,
  bodyStyles,
  provinces,
  searchInput,
  make,
  bodyStyle,
  province,
  gradeMin,
  sort,
  onSearchInputChange,
  onMakeChange,
  onBodyStyleChange,
  onProvinceChange,
  onGradeMinChange,
  onSortChange,
  hasActiveFilters,
  onClear,
}: Props) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6">
      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Search make, model, year, trim, city…"
          className="w-full border border-zinc-200 rounded-md pl-3 pr-9 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
        />
        {searchInput && (
          <button
            onClick={() => onSearchInputChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Make */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Make</label>
          <select value={make} onChange={(e) => onMakeChange(e.target.value)} className={selectClass}>
            <option value="">All makes</option>
            {makes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Body style */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Body Style</label>
          <select value={bodyStyle} onChange={(e) => onBodyStyleChange(e.target.value)} className={selectClass}>
            <option value="">All styles</option>
            {bodyStyles.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Province */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Province</label>
          <select value={province} onChange={(e) => onProvinceChange(e.target.value)} className={selectClass}>
            <option value="">All provinces</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Condition grade */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs text-zinc-400 uppercase tracking-wide font-medium">
            Min Condition Grade: <span className="font-mono text-zinc-700">{gradeMin.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={gradeMin}
            onChange={(e) => onGradeMinChange(parseFloat(e.target.value))}
            className="accent-amber-400 w-full"
          />
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Sort</label>
          <select value={sort} onChange={(e) => onSortChange(e.target.value)} className={selectClass}>
            <option value="bid_asc">Current bid: low to high</option>
            <option value="bid_desc">Current bid: high to low</option>
            <option value="condition_desc">Condition grade: best first</option>
            <option value="ending_soon">Ending soon</option>
          </select>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors underline underline-offset-2 self-end pb-2"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}
