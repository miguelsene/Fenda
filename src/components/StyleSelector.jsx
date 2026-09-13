import { useTheme } from '../context/ThemeContext'

const STYLES = [
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'ai', label: 'AI Futurista' },
  { id: '16bit', label: '16-bit' },
  { id: 'neon', label: 'Neon' },
  { id: 'anime', label: 'Anime' },
  { id: 'hellokitty', label: 'Hello Kitty' }
]

export default function StyleSelector() {
  const { theme, toggleTheme, style, setAppStyle } = useTheme()

  return (
    <div className="style-selector">
      <select value={style} onChange={(e) => setAppStyle(e.target.value)} aria-label="Escolher estilo">
        {STYLES.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>

      <button className="toon-btn small" onClick={toggleTheme} title="Alternar claro/escuro">
        {theme === 'light' ? 'Claro' : 'Escuro'}
      </button>
    </div>
  )
}
