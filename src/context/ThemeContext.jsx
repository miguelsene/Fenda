import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_PALETTE_ID,
  PALETTES,
  applyThemeTokens,
  buildThemeTokens,
  findPaletteByColors,
  getPalette
} from '../lib/palettes'

const THEME_STORAGE_KEY = 'nex.paletteId'
const LEGACY_PALETTE_KEY = 'nex.palette'
const STYLE_STORAGE_KEY = 'nex.style'

// Tema fixo: o app inteiro usa apenas o estilo 16-bit.
export const APP_STYLE = '16bit'

const ThemeContext = createContext(null)

function readStoredPaletteId() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && PALETTES.some((palette) => palette.id === stored)) return stored

    // Migra a escolha antiga (array de cores) para o novo id de paleta.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_PALETTE_KEY) || 'null')
    const migrated = findPaletteByColors(legacy)
    if (migrated) return migrated
  } catch {
    /* storage indisponível — usa o padrão */
  }
  return DEFAULT_PALETTE_ID
}

export function ThemeProvider({ children }) {
  const [paletteId, setPaletteId] = useState(readStoredPaletteId)
  const [switchCount, setSwitchCount] = useState(0)

  const palette = useMemo(() => getPalette(paletteId), [paletteId])
  const tokens = useMemo(() => buildThemeTokens(palette.colors), [palette])

  // O estilo é sempre 16-bit — mantemos o atributo para os seletores de CSS.
  useEffect(() => {
    document.documentElement.setAttribute('data-style', APP_STYLE)
    try {
      localStorage.setItem(STYLE_STORAGE_KEY, APP_STYLE)
    } catch {
      /* ignora */
    }
  }, [])

  useEffect(() => {
    applyThemeTokens(tokens)
    document.documentElement.setAttribute('data-palette', palette.id)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, palette.id)
      localStorage.removeItem(LEGACY_PALETTE_KEY)
    } catch {
      /* ignora */
    }
  }, [tokens, palette])

  // Ao trocar de paleta, liga transições curtas para as cores "escorrerem"
  // em vez de trocarem de forma seca.
  useEffect(() => {
    if (!switchCount) return undefined
    const { body } = document
    body.classList.add('palette-transition')
    const timer = setTimeout(() => body.classList.remove('palette-transition'), 520)
    return () => clearTimeout(timer)
  }, [switchCount])

  const applyPalette = useCallback((nextId) => {
    if (!PALETTES.some((item) => item.id === nextId)) return
    setPaletteId((current) => {
      if (current === nextId) return current
      setSwitchCount((count) => count + 1)
      return nextId
    })
  }, [])

  const cyclePalette = useCallback((direction = 1) => {
    setPaletteId((current) => {
      const index = PALETTES.findIndex((item) => item.id === current)
      const next = (index + direction + PALETTES.length) % PALETTES.length
      setSwitchCount((count) => count + 1)
      return PALETTES[next].id
    })
  }, [])

  const value = useMemo(
    () => ({
      style: APP_STYLE,
      palettes: PALETTES,
      palette,
      paletteId: palette.id,
      paletteColors: palette.colors,
      tokens,
      switchCount,
      applyPalette,
      cyclePalette
    }),
    [palette, tokens, switchCount, applyPalette, cyclePalette]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeContext
