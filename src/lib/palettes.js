// As 5 paletas do tema 16-bit. Cada paleta tem 5 cores (p0..p4) que são
// convertidas em tokens de UI (fundo, painel, texto, destaque...) por
// `buildThemeTokens`, sempre com contraste garantido.

import {
  bestTextOn,
  contrastRatio,
  darken,
  ensureContrast,
  isDarkColor,
  lighten,
  mix,
  normalizeHex,
  relativeLuminance,
  withAlpha
} from './color'

export const PALETTES = [
  {
    id: 'pastel',
    name: 'Pastel',
    hint: 'Claro e suave',
    tone: 'light',
    colors: ['#f3e7d7', '#f7d7cd', '#f8c7c9', '#e0c0c7', '#c7b9c5']
  },
  {
    id: 'oceano',
    name: 'Oceano',
    hint: 'Fundo do mar',
    tone: 'dark',
    colors: ['#20130a', '#142026', '#123142', '#3b657a', '#e9f0c9']
  },
  {
    id: 'brasa',
    name: 'Brasa',
    hint: 'Vermelho quente',
    tone: 'dark',
    colors: ['#1c0113', '#6b0103', '#a30006', '#c21a01', '#f03c02']
  },
  {
    id: 'cinzas',
    name: 'Cinzas',
    hint: 'Monocromático',
    tone: 'light',
    colors: ['#d9d9db', '#b7ae8f', '#978f84', '#4a362f', '#121210']
  },
  {
    id: 'ambar',
    name: 'Âmbar',
    hint: 'Dourado retrô',
    tone: 'dark',
    colors: ['#240f03', '#4b2409', '#bd7a22', '#e79022', '#df621c']
  }
]

export const DEFAULT_PALETTE_ID = PALETTES[0].id

export function getPalette(id) {
  return PALETTES.find((palette) => palette.id === id) || PALETTES[0]
}

/** Encontra a paleta cujas cores combinam com uma lista vinda do storage antigo. */
export function findPaletteByColors(colors) {
  if (!Array.isArray(colors) || colors.length !== 5) return null
  const target = colors.map((color) => normalizeHex(color)).join(',')
  const match = PALETTES.find(
    (palette) => palette.colors.map((color) => normalizeHex(color)).join(',') === target
  )
  return match ? match.id : null
}

const DANGER_DARK = '#ff6b6b'
const DANGER_LIGHT = '#b3252a'

/**
 * Converte as 5 cores de uma paleta em variáveis CSS (sem o prefixo `--`).
 */
export function buildThemeTokens(rawColors) {
  const colors = rawColors.map((color) => normalizeHex(color))
  const [p0, p1, p2, p3, p4] = colors

  const dark = isDarkColor(p0) || relativeLuminance(p0) < 0.35

  // Fundo e texto base — valem para os dois tons.
  const bg = p0
  const inkSeed = dark ? p4 : p4
  const ink = ensureContrast(inkSeed, bg, dark ? 5.2 : 6.2, dark ? 'lighten' : 'darken')

  const tokens = {
    p0,
    p1,
    p2,
    p3,
    p4,
    'bg': bg,
    'ink': ink,
    'font-display': "'Press Start 2P', monospace",
    'font-body': "'VT323', 'Press Start 2P', monospace",
    'font-ui': "'Silkscreen', 'Press Start 2P', monospace"
  }

  if (dark) {
    const panel = mix(p1, bg, 0.22)
    const panelSoft = mix(p2, p1, 0.45)
    const accent = ensureContrast(p3, panel, 3, 'lighten')
    Object.assign(tokens, {
      'tone': 'dark',
      'scheme': 'dark',
      'bg-alt': mix(bg, p1, 0.6),
      'bg-deep': darken(bg, 0.35),
      'bg-glow': withAlpha(accent, 0.22),
      'panel': panel,
      'panel-soft': panelSoft,
      'panel-raised': mix(p1, p4, 0.09),
      'panel-deep': darken(panel, 0.22),
      'panel-ink': ink,
      'edge': mix(p2, p4, 0.45),
      'edge-soft': mix(p2, bg, 0.3),
      'edge-dark': darken(bg, 0.4),
      'edge-light': mix(p2, p4, 0.65),
      'bevel-light': withAlpha(mix(p2, p4, 0.8), 0.65),
      'bevel-dark': withAlpha(darken(bg, 0.5), 0.85),
      'ink-soft': mix(ink, bg, 0.38),
      'ink-faint': mix(ink, bg, 0.62),
      'line': withAlpha(p4, 0.14),
      'grid': withAlpha(p4, 0.06),
      'scanline': withAlpha(bg, 0.5),
      'accent': accent,
      'accent-soft': mix(accent, bg, 0.45),
      'accent-strong': lighten(accent, 0.18),
      'accent-ink': bestTextOn(accent),
      'accent-glow': withAlpha(accent, 0.5),
      'dark-surface': darken(mix(p1, bg, 0.35), 0.35),
      'danger': DANGER_DARK,
      'danger-ink': bestTextOn(DANGER_DARK),
      'danger-glow': withAlpha(DANGER_DARK, 0.45),
      'ok': mix(p4, '#7bd88f', 0.55),
      'shadow': withAlpha(darken(bg, 0.6), 0.7),
      'highlight': lighten(p1, 0.35)
    })
    return tokens
  }

  // Paletas claras: painéis quase brancos para dar relevo no fundo pastel.
  const panel = mix(p0, '#ffffff', 0.62)
  const accent = ensureContrast(p3, bg, 3.4, 'darken')
  const danger = DANGER_LIGHT
  Object.assign(tokens, {
    'tone': 'light',
    'scheme': 'light',
    'bg-alt': mix(p0, p1, 0.85),
    'bg-deep': mix(p2, p3, 0.55),
    'bg-glow': withAlpha(p2, 0.75),
    'panel': panel,
    'panel-soft': mix(p1, '#ffffff', 0.42),
    'panel-raised': mix(p2, '#ffffff', 0.6),
    'panel-deep': mix(p1, p2, 0.65),
    'panel-ink': ink,
    'edge': mix(p4, '#000000', 0.22),
    'edge-soft': mix(p3, '#ffffff', 0.45),
    'edge-dark': mix(p4, '#000000', 0.42),
    'edge-light': mix(p2, '#ffffff', 0.7),
    'bevel-light': withAlpha('#ffffff', 0.8),
    'bevel-dark': withAlpha(mix(p4, '#000000', 0.3), 0.5),
    'ink-soft': mix(ink, bg, 0.34),
    'ink-faint': mix(ink, bg, 0.58),
    'line': withAlpha(p4, 0.22),
    'grid': withAlpha(p4, 0.14),
    'scanline': withAlpha('#ffffff', 0.42),
    'accent': accent,
    'accent-soft': mix(accent, bg, 0.5),
    'accent-strong': darken(accent, 0.18),
    'accent-ink': bestTextOn(accent),
    'accent-glow': withAlpha(accent, 0.42),
    'dark-surface': darken(mix(p4, '#000000', 0.35), 0.3),
    'danger': danger,
    'danger-ink': bestTextOn(danger),
    'danger-glow': withAlpha(danger, 0.4),
    'ok': mix(p4, '#1f7a3d', 0.45),
    'shadow': withAlpha(mix(p4, '#000000', 0.1), 0.32),
    'highlight': '#ffffff'
  })
  return tokens
}

/** Aplica os tokens no elemento <html>. */
export function applyThemeTokens(tokens) {
  const root = document.documentElement
  Object.entries(tokens).forEach(([key, value]) => {
    if (typeof value !== 'string') return
    if (key === 'tone' || key === 'scheme') return
    root.style.setProperty(`--${key}`, value)
  })
  root.setAttribute('data-tone', tokens.tone)
  root.style.colorScheme = tokens.scheme
  root.setAttribute('data-dark', tokens.tone === 'dark' ? 'true' : 'false')
}

/** Nível de contraste mínimo entre duas cores — usado só para debug/validação. */
export function tokenContrast(a, b) {
  return contrastRatio(a, b)
}

export { lighten, darken, mix }
