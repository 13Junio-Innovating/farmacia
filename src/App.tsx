import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import NewOrder from '@/pages/NewOrder'
import Reports from '@/pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pt-16">
        <header className="bg-white border-b fixed top-0 inset-x-0 z-50">
          <div className="container flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Logo" className="brand-logo" />
            </div>
            <nav className="flex items-center gap-2">
              <NavLink to="/" end className={({ isActive }) => `btn nav-dashboard ${isActive ? 'btn-active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/novo" className={({ isActive }) => `btn nav-new ${isActive ? 'btn-active' : ''}`}>
                Novo Pedido
              </NavLink>
              <NavLink to="/relatorios" className={({ isActive }) => `btn nav-reports ${isActive ? 'btn-active' : ''}`}>
                Relatórios
              </NavLink>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/novo" element={<NewOrder />} />
          <Route path="/relatorios" element={<Reports />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
