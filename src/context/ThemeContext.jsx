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
      return localStorage.getItem('nex.style') || 'cartoon'
    } catch {
      return 'cartoon'
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

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  function setAppStyle(s) {
    setStyle(s)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, style, setAppStyle }}>
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
