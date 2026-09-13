import { useMemo } from 'react'
import { CoinSprite, HeartSprite, InvaderSprite, StarSprite } from './PixelSprites'

const STAR_COUNT = 34
const SPRITE_COUNT = 6
const SPRITE_COMPONENTS = [InvaderSprite, HeartSprite, CoinSprite, StarSprite]

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

function buildStars() {
  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const size = randomBetween(2, 4)
    return {
      id: `star-${index}`,
      style: {
        top: `${randomBetween(2, 96)}%`,
        left: `${randomBetween(1, 98)}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${(index % 9) * 0.37}s`,
        animationDuration: `${2.6 + (index % 5) * 0.6}s`
      },
      ink: index % 3 === 0
    }
  })
}

function buildSprites() {
  return Array.from({ length: SPRITE_COUNT }, (_, index) => {
    const Sprite = SPRITE_COMPONENTS[index % SPRITE_COMPONENTS.length]
    const size = randomBetween(26, 54)
    return {
      id: `sprite-${index}`,
      Sprite,
      size,
      drift: index % 2 === 1,
      style: {
        top: `${randomBetween(8, 84)}%`,
        left: `${randomBetween(4, 92)}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${index * 0.9}s`
      }
    }
  })
}

export default function PixelBackground() {
  const stars = useMemo(buildStars, [])
  const sprites = useMemo(buildSprites, [])

  return (
    <div className="pixel-bg" aria-hidden="true">
      <span className="pixel-bg__glow pixel-bg__glow--one" />
      <span className="pixel-bg__glow pixel-bg__glow--two" />
      <span className="pixel-bg__glow pixel-bg__glow--three" />

      {stars.map((star) => (
        <span
          key={star.id}
          className={`pixel-bg__star${star.ink ? ' pixel-bg__star--ink' : ''}`}
          style={star.style}
        />
      ))}

      {sprites.map(({ id, Sprite, style, drift, size }) => (
        <span
          key={id}
          className={`pixel-bg__sprite${drift ? ' pixel-bg__sprite--drift' : ''}`}
          style={style}
        >
          <Sprite width={size} height={size} color="currentColor" />
        </span>
      ))}

      <span className="pixel-bg__floor" />
    </div>
  )
}
