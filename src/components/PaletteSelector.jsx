import { useTheme } from '../context/ThemeContext'

const PALETTES = [
  ['#f3e7d7','#f7d7cd','#f8c7c9','#e0c0c7','#c7b9c5'],
  ['#20130a','#142026','#123142','#3b657a','#e9f0c9'],
  ['#1c0113','#6b0103','#a30006','#c21a01','#f03c02'],
  ['#d9d9db','#b7ae8f','#978f84','#4a362f','#121210'],
  ['#240f03','#4b2409','#bd7a22','#e79022','#df621c']
]

export default function PaletteSelector() {
  const { palette, setAppPalette } = useTheme()

  function apply(p) {
    setAppPalette(p)
  }

  return (
    <div className="palette-selector">
      {PALETTES.map((p, idx) => (
        <div key={idx} className={`palette-swatch ${palette && JSON.stringify(p) === JSON.stringify(palette) ? 'selected' : ''}`} onClick={() => apply(p)}>
          {p.map((c, i) => (
            <span key={i} className="swatch-dot" style={{background:c}} />
          ))}
        </div>
      ))}
    </div>
  )
}
