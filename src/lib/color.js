// Utilitários de cor (hex #rrggbb). Sem dependências externas.
// Usados para transformar as 5 cores de cada paleta em tokens de UI
// com contraste garantido (fundo, painéis, texto, destaque, etc).

const HEX_PATTERN = /^[0-9a-fA-F]{6}$/

export function normalizeHex(value) {
  if (typeof value !== 'string') return '#000000'
  let hex = value.trim().replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }
  if (!HEX_PATTERN.test(hex)) return '#000000'
  return `#${hex.toLowerCase()}`
}

export function hexToRgb(hex) {
  const safe = normalizeHex(hex)
  return {
    r: parseInt(safe.slice(1, 3), 16),
    g: parseInt(safe.slice(3, 5), 16),
    b: parseInt(safe.slice(5, 7), 16)
  }
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function toHexPair(value) {
  return clampChannel(value).toString(16).padStart(2, '0')
}

export function rgbToHex({ r, g, b }) {
  return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`
}

function clamp01(value) {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(1, value))
}

/** Mistura duas cores. t = 0 devolve `a`, t = 1 devolve `b`. */
export function mix(a, b, t) {
  const amount = clamp01(t)
  const first = hexToRgb(a)
  const second = hexToRgb(b)
  return rgbToHex({
    r: first.r + (second.r - first.r) * amount,
    g: first.g + (second.g - first.g) * amount,
    b: first.b + (second.b - first.b) * amount
  })
}

export function lighten(hex, t) {
  return mix(hex, '#ffffff', t)
}

export function darken(hex, t) {
  return mix(hex, '#000000', t)
}

function channelToLinear(channel) {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

/** Luminância relativa (WCAG). 0 = preto, 1 = branco. */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  return (
    0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b)
  )
}

export function contrastRatio(a, b) {
  const first = relativeLuminance(a)
  const second = relativeLuminance(b)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

export function isDarkColor(hex, threshold = 0.4) {
  return relativeLuminance(hex) < threshold
}

/** Cor de texto legível sobre `background`. */
export function bestTextOn(background, darkCandidate = '#14100f', lightCandidate = '#fdfbf5') {
  return contrastRatio(darkCandidate, background) >= contrastRatio(lightCandidate, background)
    ? darkCandidate
    : lightCandidate
}

/** Empurra `color` (escurecendo ou clareando) até atingir `minRatio` contra `against`. */
export function ensureContrast(color, against, minRatio, direction = 'auto') {
  const shouldLighten =
    direction === 'lighten' ? true : direction === 'darken' ? false : isDarkColor(against)
  let current = normalizeHex(color)
  for (let step = 0; step < 24; step += 1) {
    if (contrastRatio(current, against) >= minRatio) return current
    current = shouldLighten ? lighten(current, 0.07) : darken(current, 0.07)
  }
  return current
}

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`
}
