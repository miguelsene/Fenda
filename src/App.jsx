import { Routes, Route } from 'react-router-dom'
import { AccountProvider } from './context/AccountContext'
import Home from './pages/Home'
import Room from './pages/Room'
import PaletteDock from './components/PaletteDock'
import PixelBackground from './components/PixelBackground'

export default function App() {
  return (
    <AccountProvider>
      <PixelBackground />
      <PaletteDock />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:code" element={<Room />} />
      </Routes>
    </AccountProvider>
  )
}
