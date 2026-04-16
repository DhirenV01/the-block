import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Navbar() {
  const { watchlist } = useApp()

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-zinc-900 font-semibold text-lg tracking-tight">
          The Block
        </Link>
        <Link
          to="/watchlist"
          className="relative text-zinc-500 hover:text-zinc-900 transition-colors p-1"
          aria-label={`Watchlist (${watchlist.length})`}
        >
          <Heart size={20} />
          {watchlist.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-zinc-900 text-xs font-mono font-medium rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {watchlist.length > 9 ? '9+' : watchlist.length}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
