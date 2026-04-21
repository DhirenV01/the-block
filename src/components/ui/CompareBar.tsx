import { useNavigate } from 'react-router-dom'
import { X, GitCompare } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function CompareBar() {
  const { vehicles, compareList, removeFromCompare } = useApp()
  const navigate = useNavigate()

  if (compareList.length === 0) return null

  const selected = compareList
    .map((id) => vehicles.find((v) => v.id === id))
    .filter(Boolean) as NonNullable<(typeof vehicles)[0]>[]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GitCompare size={16} className="text-zinc-400 flex-shrink-0" />
          <div className="flex gap-3 flex-wrap">
            {selected.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-1.5 bg-zinc-100 rounded-full px-3 py-1"
              >
                <span className="text-sm text-zinc-900 truncate max-w-[180px]">
                  {v.year} {v.make} {v.model}
                </span>
                <button
                  onClick={() => removeFromCompare(v.id)}
                  className="text-zinc-400 hover:text-zinc-700 transition-colors flex-shrink-0"
                  aria-label={`Remove ${v.make} ${v.model} from compare`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {compareList.length === 1 && (
              <span className="text-sm text-zinc-400 self-center">
                Add one more vehicle to compare
              </span>
            )}
          </div>
        </div>

        {compareList.length === 2 && (
          <button
            onClick={() => navigate('/compare')}
            className="flex-shrink-0 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors"
          >
            Compare
          </button>
        )}
      </div>
    </div>
  )
}
