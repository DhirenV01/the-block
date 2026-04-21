import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import CompareBar from '../ui/CompareBar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white pb-16">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <CompareBar />
    </div>
  )
}
