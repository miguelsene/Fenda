import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('nex.theme') || 'light'
    } catch {
      return 'light'
    }
  })
  const [style, setStyle] = useState(() => {
    try {
      return localStorage.getItem('nex.style') || '16bit'
    } catch {
      return '16bit'
    }
  })
  const [palette, setPalette] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nex.palette')) || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('nex.theme', theme)
    } catch {}
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem('nex.style', style)
    } catch {}
    document.documentElement.setAttribute('data-style', style)
  }, [style])

  useEffect(() => {
    try {
      localStorage.setItem('nex.palette', JSON.stringify(palette))
    } catch {}
    if (palette && Array.isArray(palette)) {
      // apply palette to CSS variables --p0..--p4
      palette.forEach((c, i) => {
        document.documentElement.style.setProperty(`--p${i}`, c)
      })
    }
  }, [palette])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  function setAppStyle(s) {
    setStyle(s)
  }

  function setAppPalette(p) {
    setPalette(p)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, style, setAppStyle, palette, setAppPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeContext
