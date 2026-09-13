import { useEffect, useRef } from 'react'

export default function ContextMenu({ x, y, name, volume, muted, onVolumeChange, onToggleMute, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="toon-panel context-menu"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="context-menu-title">🔊 {name}</div>
      <label className="context-menu-row">
        <input type="checkbox" checked={muted} onChange={onToggleMute} />
        Silenciar para mim
      </label>
      <label className="context-menu-row">
        <span>Volume</span>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.01"
          value={volume}
          disabled={muted}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        />
      </label>
    </div>
  )
}
