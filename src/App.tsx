import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import InventoryPage from './pages/InventoryPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import WatchlistPage from './pages/WatchlistPage'
import ComparePage from './pages/ComparePage'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<InventoryPage />} />
            <Route path="vehicle/:id" element={<VehicleDetailPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="compare" element={<ComparePage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
