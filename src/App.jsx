import { Routes, Route } from 'react-router-dom'
import { AccountProvider } from './context/AccountContext'
import Home from './pages/Home'
import Room from './pages/Room'

export default function App() {
  return (
    <AccountProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:code" element={<Room />} />
      </Routes>
    </AccountProvider>
  )
}
