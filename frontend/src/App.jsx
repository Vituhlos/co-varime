import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import Detail from './pages/Detail'
import Oblibene from './pages/Oblibene'
import Historie from './pages/Historie'
import NakupniSeznam from './pages/NakupniSeznam'
import Nastaveni from './pages/Nastaveni'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/recipe/:id" element={<Detail />} />
        <Route path="/oblibene" element={<Oblibene />} />
        <Route path="/historie" element={<Historie />} />
        <Route path="/nakupni-seznam" element={<NakupniSeznam />} />
        <Route path="/nastaveni" element={<Nastaveni />} />
      </Routes>
    </BrowserRouter>
  )
}
