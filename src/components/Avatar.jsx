export default function Avatar({ name, src, size = 48 }) {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  const style = { width: size, height: size, fontSize: size * 0.4 }

  if (src) {
    return <img className="avatar" style={style} src={src} alt={name} />
  }

  return (
    <div className="avatar avatar-fallback" style={style}>
      {initials || '?'}
    </div>
  )
}
