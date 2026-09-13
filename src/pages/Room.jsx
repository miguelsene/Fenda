import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from '../context/AccountContext'
import { RoomProvider, useRoom } from '../context/RoomContext'
import VideoTile from '../components/VideoTile'
import ChatPanel from '../components/ChatPanel'
import MusicBar from '../components/MusicBar'
import SettingsModal from '../components/SettingsModal'
import ContextMenu from '../components/ContextMenu'
import { addRecentRoom } from '../lib/storage'
import { useTheme } from '../context/ThemeContext'

export default function RoomPage() {
  const { code } = useParams()
  const { activeProfile } = useAccount()
  const navigate = useNavigate()

  useEffect(() => {
    if (code) addRecentRoom(code)
  }, [code])

  if (!activeProfile) {
    // Sem nome definido: manda pra home pra configurar antes de entrar
    // preserva o código para que a home possa preencher o campo de entrada
    navigate('/', { state: { toJoin: code } })
    return null
  }

  return (
    <RoomProvider roomCode={code} profile={{ name: activeProfile.name, avatar: activeProfile.avatar }}>
      <RoomView code={code} profile={activeProfile} />
    </RoomProvider>
  )
}

function RoomView({ code, profile }) {
  const navigate = useNavigate()
  const {
    selfId,
    peers,
    cameraStreams,
    screenStreams,
    messages,
    musicState,
    localCameraStream,
    localScreenStream,
    micEnabled,
    camEnabled,
    joining,
    sendChatMessage,
    broadcastMusic,
    startCamera,
    stopCamera,
    startScreenShare,
    stopScreenShare,
    toggleMic,
    replaceCameraStream,
    initVoice,
    leaveRoom
  } = useRoom()

  const [chatOpen, setChatOpen] = useState(true)
  const [musicCollapsed, setMusicCollapsed] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, peerId, name }
  const [peerVolumes, setPeerVolumes] = useState({}) // { peerId: { volume, muted } }
  const [focusedTile, setFocusedTile] = useState(null) // { peerId, kind } | null
  const [copyFeedback, setCopyFeedback] = useState('')

  useEffect(() => {
    initVoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleLeave() {
    leaveRoom()
    navigate('/')
  }

  function getPeerVolume(peerId) {
    return peerVolumes[peerId] || { volume: 1, muted: false }
  }

  function openContextMenu(e, peerId, name) {
    setContextMenu({ x: e.clientX, y: e.clientY, peerId, name })
  }

  async function handleShareLink() {
    const url = `${window.location.origin}/#/room/${code}`
    try {
      await navigator.clipboard.writeText(url)
      setCopyFeedback('Link copiado!')
    } catch {
      setCopyFeedback(url)
    }
    setTimeout(() => setCopyFeedback(''), 3000)
  }

  async function handleApplyDeviceSettings(constraints) {
    await replaceCameraStream(constraints)
  }

  // Monta a lista de "tiles" a serem exibidos: minha câmera, câmeras dos
  // outros, minha tela (se compartilhando) e telas dos outros.
  const tiles = useMemo(() => {
    const list = []

    list.push({
      id: 'self-camera',
      peerId: selfId,
      kind: 'camera',
      isLocal: true,
      stream: localCameraStream,
      name: profile.name,
      avatar: profile.avatar,
      micOff: !micEnabled
    })

    if (localScreenStream) {
      list.push({
        id: 'self-screen',
        peerId: selfId,
        kind: 'screen',
        isLocal: true,
        stream: localScreenStream,
        name: profile.name,
        avatar: profile.avatar
      })
    }

    Object.entries(peers).forEach(([peerId, p]) => {
      list.push({
        id: `${peerId}-camera`,
        peerId,
        kind: 'camera',
        isLocal: false,
        stream: cameraStreams[peerId] || null,
        name: p?.name || 'Participante',
        avatar: p?.avatar || null
      })
      if (screenStreams[peerId]) {
        list.push({
          id: `${peerId}-screen`,
          peerId,
          kind: 'screen',
          isLocal: false,
          stream: screenStreams[peerId],
          name: p?.name || 'Participante',
          avatar: p?.avatar || null
        })
      }
    })

    return list
  }, [selfId, localCameraStream, localScreenStream, peers, cameraStreams, screenStreams, profile, micEnabled])

  const focusedTileData = focusedTile
    ? tiles.find((t) => t.peerId === focusedTile.peerId && t.kind === focusedTile.kind)
    : null

  const participantCount = Object.keys(peers).length + 1

  const { theme, toggleTheme } = useTheme()

  return (
    <div className="room-page">
      {/** Loading overlay while joining the room */}
      {joining && (
        <div className="room-loading-overlay">
          <img src="/nex.svg" alt="Nex" className="logo" onError={(e)=>{e.target.style.display='none'}} />
          <div className="room-loading-spinner" />
          <div style={{fontWeight:700}}>Entrando na sala...</div>
          <div className="muted-text">Aguarde enquanto conectamos você — pode demorar alguns segundos.</div>
        </div>
      )}
      <header className="room-top-bar">
        <div className="room-code-box">
          <span className="muted-text">Sala</span>
          <strong className="room-code">{code}</strong>
          <button className="toon-btn small" onClick={handleShareLink}><i className="bi bi-link-45deg" style={{marginRight:8}}></i>Compartilhar</button>
          {copyFeedback && <span className="copy-feedback">{copyFeedback}</span>}
        </div>
        <div className="room-participants-count"><i className="bi bi-people-fill" style={{marginRight:6}}></i> {participantCount}</div>
      </header>

      <main className="room-main">
        <section className={`video-area ${chatOpen ? 'with-chat' : ''}`}>
          {focusedTileData ? (
            <div className="focused-layout">
              <VideoTile
                stream={focusedTileData.stream}
                name={focusedTileData.name}
                avatar={focusedTileData.avatar}
                isLocal={focusedTileData.isLocal}
                kind={focusedTileData.kind}
                micOff={focusedTileData.micOff}
                isFocused
                volume={getPeerVolume(focusedTileData.peerId).volume}
                muted={getPeerVolume(focusedTileData.peerId).muted}
                onContextMenu={(e) => openContextMenu(e, focusedTileData.peerId, focusedTileData.name)}
                onMaximize={() => setFocusedTile(null)}
              />
              <div className="focused-strip">
                {tiles
                  .filter((t) => !(t.peerId === focusedTile.peerId && t.kind === focusedTile.kind))
                  .map((t) => (
                    <VideoTile
                      key={t.id}
                      stream={t.stream}
                      name={t.name}
                      avatar={t.avatar}
                      isLocal={t.isLocal}
                      kind={t.kind}
                      micOff={t.micOff}
                      volume={getPeerVolume(t.peerId).volume}
                      muted={getPeerVolume(t.peerId).muted}
                      onContextMenu={(e) => !t.isLocal && openContextMenu(e, t.peerId, t.name)}
                      onMaximize={() => setFocusedTile({ peerId: t.peerId, kind: t.kind })}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className={`video-grid grid-count-${Math.min(tiles.length, 9)}`}>
              {tiles.map((t) => (
                <VideoTile
                  key={t.id}
                  stream={t.stream}
                  name={t.name}
                  avatar={t.avatar}
                  isLocal={t.isLocal}
                  kind={t.kind}
                  micOff={t.micOff}
                  volume={getPeerVolume(t.peerId).volume}
                  muted={getPeerVolume(t.peerId).muted}
                  onContextMenu={(e) => !t.isLocal && openContextMenu(e, t.peerId, t.name)}
                  onMaximize={() => setFocusedTile({ peerId: t.peerId, kind: t.kind })}
                />
              ))}
            </div>
          )}

          <MusicBar
            musicState={musicState}
            onBroadcast={broadcastMusic}
            collapsed={musicCollapsed}
            onToggleCollapsed={() => setMusicCollapsed((c) => !c)}
          />
        </section>

        <ChatPanel messages={messages} onSend={sendChatMessage} selfId={selfId} visible={chatOpen} />
      </main>

      <footer className="room-toolbar">
        <button className={`toon-btn round ${micEnabled ? '' : 'off'}`} onClick={toggleMic} title="Microfone">
          <i className={micEnabled ? 'bi bi-mic-fill' : 'bi bi-mic-mute-fill'}></i>
        </button>
        <button
          className={`toon-btn round ${camEnabled ? 'on' : ''}`}
          onClick={() => (camEnabled ? stopCamera() : startCamera())}
          title="Câmera"
        >
          <i className={camEnabled ? 'bi bi-camera-video-fill' : 'bi bi-camera-video-off'}></i>
        </button>
        <button
          className={`toon-btn round ${localScreenStream ? 'on' : ''}`}
          onClick={() => (localScreenStream ? stopScreenShare() : startScreenShare())}
          title="Compartilhar tela"
        >
          <i className="bi bi-display"></i>
        </button>
        <button className="toon-btn round" onClick={() => setChatOpen((v) => !v)} title="Chat">
          <i className="bi bi-chat-left-text"></i>
        </button>
        <button className="toon-btn round" onClick={() => setMusicCollapsed((v) => !v)} title="Música">
          <i className="bi bi-music-note"></i>
        </button>
        <button className="toon-btn round" onClick={() => setSettingsOpen(true)} title="Configurações">
          <i className="bi bi-gear"></i>
        </button>
        <button className="toon-btn round" onClick={toggleTheme} title="Alternar tema">
          <i className={theme === 'light' ? 'bi bi-sun' : 'bi bi-moon'}></i>
        </button>
        <button className="toon-btn round leave" onClick={handleLeave} title="Sair da chamada">
          <i className="bi bi-telephone"></i>
        </button>
      </footer>

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} onApplyCamera={handleApplyDeviceSettings} />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          name={contextMenu.name}
          volume={getPeerVolume(contextMenu.peerId).volume}
          muted={getPeerVolume(contextMenu.peerId).muted}
          onVolumeChange={(v) =>
            setPeerVolumes((prev) => ({ ...prev, [contextMenu.peerId]: { ...getPeerVolume(contextMenu.peerId), volume: v } }))
          }
          onToggleMute={() =>
            setPeerVolumes((prev) => ({
              ...prev,
              [contextMenu.peerId]: {
                ...getPeerVolume(contextMenu.peerId),
                muted: !getPeerVolume(contextMenu.peerId).muted
              }
            }))
          }
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
