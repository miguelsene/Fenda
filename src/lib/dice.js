// Parseia strings como "2d20 3d10 1d6" e rola os dados.
// Retorna null se a string não contiver nenhum padrão válido de dado.

const DICE_REGEX = /(\d*)d(\d+)/gi

export function parseDiceString(input) {
  if (!input) return null
  const matches = [...input.matchAll(DICE_REGEX)]
  if (matches.length === 0) return null

  const groups = matches.map((m) => {
    const count = m[1] ? parseInt(m[1], 10) : 1
    const sides = parseInt(m[2], 10)
    return { count: Math.min(count, 100), sides: Math.min(sides, 1000), raw: m[0] }
  })

  return groups
}

export function rollDice(input) {
  const groups = parseDiceString(input)
  if (!groups) return null

  const results = groups.map((g) => {
    const rolls = Array.from({ length: g.count }, () => 1 + Math.floor(Math.random() * g.sides))
    const subtotal = rolls.reduce((a, b) => a + b, 0)
    return { ...g, rolls, subtotal }
  })

  const total = results.reduce((a, r) => a + r.subtotal, 0)

  return { groups: results, total, raw: input.trim() }
}
