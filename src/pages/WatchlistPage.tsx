import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import VehicleCard from '../components/ui/VehicleCard'

export default function WatchlistPage() {
  const { vehicles, watchlist } = useApp()

  const watchedVehicles = vehicles.filter((v) => watchlist.includes(v.id))

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Watchlist</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {watchedVehicles.length} vehicle{watchedVehicles.length !== 1 ? 's' : ''}
        </p>
      </div>

      {watchedVehicles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500">Your watchlist is empty.</p>
          <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium text-sm mt-2 inline-block">
            Browse inventory
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchedVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  )
}
