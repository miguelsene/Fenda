import { useEffect, useRef } from 'react'
import Avatar from './Avatar'
import { useAudioLevel } from '../hooks/useAudioLevel'

export default function VideoTile({
  stream,
  name,
  avatar,
  isLocal = false,
  kind = 'camera', // 'camera' | 'screen'
  volume = 1,
  muted = false,
  micOff = false,
  isFocused = false,
  onContextMenu,
  onMaximize
}) {
  const videoRef = useRef(null)
  const speaking = useAudioLevel(kind === 'camera' ? stream : null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null
    }
  }, [stream])

  useEffect(() => {
    if (videoRef.current && !isLocal) {
      videoRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted, isLocal])

  const hasVideo = stream && stream.getVideoTracks().length > 0

  return (
    <div
      className={`video-tile ${speaking ? 'speaking' : ''} ${isFocused ? 'focused' : ''} ${
        kind === 'screen' ? 'screen-tile' : ''
      }`}
      onContextMenu={(e) => {
        if (!isLocal && onContextMenu) {
          e.preventDefault()
          onContextMenu(e)
        }
      }}
      onDoubleClick={onMaximize}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={kind === 'screen' ? 'video-el screen-video' : 'video-el'}
        />
      ) : (
        <div className="video-placeholder">
          <Avatar name={name} src={avatar} size={72} />
        </div>
      )}

      <div className="tile-label">
        {kind === 'screen' && <span className="tile-badge">🖥️ tela</span>}
        <Avatar name={name} src={avatar} size={22} />
        <span className="tile-name">{name}{isLocal ? ' (você)' : ''}</span>
        {micOff && <span className="tile-mic-off">🔇</span>}
      </div>

      {onMaximize && (
        <button
          className="toon-btn tile-maximize-btn"
          title="Maximizar"
          onClick={(e) => {
            e.stopPropagation()
            onMaximize()
          }}
        >
          ⛶
        </button>
      )}
    </div>
  )
}
