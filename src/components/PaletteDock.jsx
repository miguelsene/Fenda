import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const FLASH_MS = 720

export default function PaletteDock({ defaultCollapsed = false }) {
  const { palettes, paletteId, paletteColors, applyPalette } = useTheme()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [flashKey, setFlashKey] = useState(0)

  // Some o flash depois da animação para não deixar elemento pendurado.
  useEffect(() => {
    if (!flashKey) return undefined
    const timer = setTimeout(() => setFlashKey(0), FLASH_MS)
    return () => clearTimeout(timer)
  }, [flashKey])

  function handlePick(id) {
    if (id === paletteId) return
    applyPalette(id)
    setFlashKey((key) => key + 1)
  }

  return (
    <>
      {flashKey > 0 && <span className="palette-flash" key={flashKey} />}

      <aside
        className={`palette-dock${collapsed ? ' is-collapsed' : ''}`}
        aria-label="Seletor de paleta de cores"
      >
        <button
          type="button"
          className="palette-dock__toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          title={collapsed ? 'Abrir paletas' : 'Fechar paletas'}
        >
          <i className="bi bi-palette-fill" aria-hidden="true" />
          <span>Paleta</span>
          <span className="palette-dock__toggle-dots" aria-hidden="true">
            {paletteColors.map((color) => (
              <span
                key={color}
                className="palette-dock__toggle-dot"
                style={{ '--dot-color': color }}
              />
            ))}
          </span>
          <span className="palette-dock__toggle-arrow" aria-hidden="true">
            {collapsed ? '▲' : '▼'}
          </span>
        </button>

        <div className="palette-dock__panel">
          <div className="palette-dock__head">
            <span className="palette-dock__title">
              <i className="bi bi-brush-fill" aria-hidden="true" />
              Cores do jogo
            </span>
          </div>

          <div className="palette-dock__list" role="radiogroup" aria-label="Paletas disponíveis">
            {palettes.map((palette) => {
              const active = palette.id === paletteId
              return (
                <button
                  key={palette.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`palette-option${active ? ' is-active' : ''}`}
                  onClick={() => handlePick(palette.id)}
                >
                  <span className="palette-option__dots" aria-hidden="true">
                    {palette.colors.map((color) => (
                      <span
                        key={color}
                        className="palette-option__dot"
                        style={{ '--dot-color': color }}
                      />
                    ))}
                  </span>
                  <span className="palette-option__meta">
                    <span className="palette-option__name">{palette.name}</span>
                    <span className="palette-option__hint">
                      {active ? 'selecionada' : palette.hint}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <p className="palette-dock__hint">
            Clique nas volinhas: o fundo, os painéis e os detalhes mudam na hora.
          </p>
        </div>
      </aside>
    </>
  )
}
