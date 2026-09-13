// Sprites em pixel art desenhados como SVG (crispEdges).
// Cada sprite é descrito por linhas de texto: 'X' = pixel aceso.

const INVADER = [
  '..X.....X..',
  '...X...X...',
  '..XXXXXXX..',
  '.XX.XXX.XX.',
  'XXXXXXXXXXX',
  'X.XXXXXXX.X',
  'X.X.....X.X',
  '...XX.XX...'
]

const HEART = [
  '.XX.XX.',
  'XXXXXXX',
  'XXXXXXX',
  '.XXXXX.',
  '..XXX..',
  '...X...'
]

const COIN = [
  '..XXX..',
  '.XXXXX.',
  'XX.X.XX',
  'XX.X.XX',
  'XX.X.XX',
  '.XXXXX.',
  '..XXX..'
]

const STAR = [
  '...X...',
  '..XXX..',
  '.XXXXX.',
  'XXXXXXX',
  '.XX.XX.',
  'XX...XX'
]

const ARROW = [
  '..X..',
  '.XXX.',
  'XXXXX',
  '..X..',
  '..X..'
]

function PixelArt({ rows, color, width, height, className }) {
  const grid = rows.map((row) => row.padEnd(rows[0].length, '.').split(''))
  const cols = grid[0].length
  const rects = []

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 'X') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
    })
  })

  return (
    <svg
      className={className}
      viewBox={`0 0 ${cols} ${grid.length}`}
      width={width}
      height={height}
      shapeRendering="crispEdges"
      fill={color}
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  )
}

export function InvaderSprite(props) {
  return <PixelArt rows={INVADER} {...props} />
}

export function HeartSprite(props) {
  return <PixelArt rows={HEART} {...props} />
}

export function CoinSprite(props) {
  return <PixelArt rows={COIN} {...props} />
}

export function StarSprite(props) {
  return <PixelArt rows={STAR} {...props} />
}

export function ArrowSprite(props) {
  return <PixelArt rows={ARROW} {...props} />
}

export const SPRITES = [InvaderSprite, HeartSprite, CoinSprite, StarSprite, ArrowSprite]
