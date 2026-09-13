import { useEffect, useRef, useState } from 'react'
import { extractYouTubeId, loadYouTubeAPI } from '../lib/youtube'

const PLAYER_DIV_ID = 'toonmeet-yt-player'

export default function MusicBar({ musicState, onBroadcast, collapsed, onToggleCollapsed }) {
  const playerRef = useRef(null)
  const readyRef = useRef(false)
  const [linkInput, setLinkInput] = useState('')
  const linkRef = useRef(null)
  const [localVolume, setLocalVolume] = useState(70)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastAppliedRef = useRef(null)

  // Cria o player do YouTube uma única vez. O <div> dele fica sempre
  // montado (mesmo com a barra "minimizada") para a música não parar.
  useEffect(() => {
    let cancelled = false
    loadYouTubeAPI().then((YT) => {
      if (cancelled) return
      playerRef.current = new YT.Player(PLAYER_DIV_ID, {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1 },
        events: {
          onReady: () => {
            readyRef.current = true
            playerRef.current.setVolume(localVolume)
          }
        }
      })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aplica o estado recebido (rede) ao player local
  useEffect(() => {
    const player = playerRef.current
    if (!player || !readyRef.current || !musicState?.videoId) return

    const key = `${musicState.videoId}-${musicState.isPlaying}-${musicState.updatedAt}`
    if (lastAppliedRef.current === key) return
    lastAppliedRef.current = key

    const currentVideoUrl = player.getVideoUrl?.() || ''
    const isDifferentVideo = !currentVideoUrl.includes(musicState.videoId)

    if (isDifferentVideo) {
      player.loadVideoById(musicState.videoId, musicState.time || 0)
      if (!musicState.isPlaying) {
        setTimeout(() => player.pauseVideo(), 300)
      }
    } else {
      const current = player.getCurrentTime?.() || 0
      if (Math.abs(current - (musicState.time || 0)) > 2.5) {
        player.seekTo(musicState.time || 0, true)
      }
      if (musicState.isPlaying) player.playVideo()
      else player.pauseVideo()
    }
  }, [musicState])

  // Progresso local (só visual)
  useEffect(() => {
    const interval = setInterval(() => {
      const player = playerRef.current
      if (player && readyRef.current && player.getDuration) {
        setProgress(player.getCurrentTime?.() || 0)
        setDuration(player.getDuration?.() || 0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function handleLoad(e) {
    e.preventDefault()
    const id = extractYouTubeId(linkInput)
    if (!id) {
      alert('Não foi possível reconhecer esse link do YouTube')
      return
    }
    onBroadcast({ videoId: id, isPlaying: true, time: 0 })
    setLinkInput('')
  }

  function handlePlayPause() {
    if (!musicState?.videoId) return
    onBroadcast({
      videoId: musicState.videoId,
      isPlaying: !musicState.isPlaying,
      time: playerRef.current?.getCurrentTime?.() || 0
    })
  }

  function handleSeek(e) {
    const newTime = parseFloat(e.target.value)
    playerRef.current?.seekTo(newTime, true)
    onBroadcast({ videoId: musicState.videoId, isPlaying: musicState.isPlaying, time: newTime })
  }

  function handleVolume(e) {
    const v = parseInt(e.target.value, 10)
    setLocalVolume(v)
    playerRef.current?.setVolume(v)
  }

  function fmt(s) {
    if (!s || Number.isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // focus input when opened
  useEffect(() => {
    if (!collapsed) {
      setTimeout(() => linkRef.current?.focus?.(), 80)
    }
  }, [collapsed])

  return (
    <div className={`music-bar toon-panel ${collapsed ? 'music-bar-collapsed' : ''}`}>
      <div className="music-bar-header" onClick={onToggleCollapsed}>
        <span><i className="bi bi-music-note" style={{marginRight:8}}></i> Música {musicState?.videoId ? '(tocando)' : ''}</span>
        <span className="collapse-arrow">{collapsed ? '▲' : '▼'}</span>
      </div>

      {/* O player fica sempre no DOM (só visualmente escondido) pra
          continuar tocando mesmo com a barra minimizada. */}
      <div className="music-bar-body">
        <div className="yt-player-wrapper">
          <div id={PLAYER_DIV_ID}></div>
        </div>

        <form className="music-link-form" onSubmit={handleLoad}>
          <input
            ref={linkRef}
            className="toon-input"
            placeholder="Cole o link do YouTube..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
          />
          <button className="toon-btn primary" type="submit">
            <i className="bi bi-play-fill" style={{marginRight:8}}></i> Tocar
          </button>
        </form>

        {musicState?.videoId && (
          <>
            <div className="music-controls-row">
              <button className="toon-btn" onClick={handlePlayPause}>
                {musicState.isPlaying ? <><i className="bi bi-pause-fill" style={{marginRight:8}}></i> Pausar</> : <><i className="bi bi-play-fill" style={{marginRight:8}}></i> Tocar</>}
              </button>
              <span className="music-time">{fmt(progress)} / {fmt(duration)}</span>
            </div>
            <input
              className="toon-range"
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
            />
            <div className="music-controls-row">
              <span><i className="bi bi-volume-up" style={{marginRight:8}}></i>Meu volume da música</span>
              <input
                className="toon-range"
                type="range"
                min="0"
                max="100"
                value={localVolume}
                onChange={handleVolume}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
