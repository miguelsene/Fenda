import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { joinRoom } from 'trystero/torrent'
import { playJoinSound, playLeaveSound, playDiceSound, playMessageSound } from '../lib/sound'
import { rollDice } from '../lib/dice'

// appId identifica seu app dentro da rede pública de sinalização usada
// pelo trystero. Não é um servidor seu — é só um "namespace".
const APP_ID = 'toonmeet-v1-ptbr'
const ROOM_RELAY_URLS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.files.fm:7073/announce'
]

const RoomContext = createContext(null)

export function RoomProvider({ roomCode, profile, children }) {
  const roomRef = useRef(null)
  const actionsRef = useRef({})
  const selfId = useRef(Math.random().toString(36).slice(2, 10))

  const [peers, setPeers] = useState({}) // { peerId: { name, avatar } }
  const [cameraStreams, setCameraStreams] = useState({}) // { peerId: MediaStream }
  const [screenStreams, setScreenStreams] = useState({}) // { peerId: MediaStream }
  const [messages, setMessages] = useState([])
  const [musicState, setMusicState] = useState(null) // { videoId, isPlaying, time, updatedAt }
  const [connected, setConnected] = useState(false)
  const [joining, setJoining] = useState(false)

  const [localCameraStream, setLocalCameraStream] = useState(null)
  const [localScreenStream, setLocalScreenStream] = useState(null)
  const [micEnabled, setMicEnabled] = useState(true)
  const [camEnabled, setCamEnabled] = useState(false)

  // Entra na sala assim que o componente monta
  useEffect(() => {
    if (!roomCode) return
    setJoining(true)
    const room = joinRoom(
      {
        appId: APP_ID,
        relayUrls: ROOM_RELAY_URLS,
        relayRedundancy: 2
      },
      `toonmeet-${roomCode}`
    )
    roomRef.current = room
    // mark as joined locally once joinRoom returned
    setJoining(false)

    const [sendProfile, getProfile] = room.makeAction('profile')
    const [sendChat, getChat] = room.makeAction('chat')
    const [sendMusic, getMusic] = room.makeAction('music')
    const [sendBye, getBye] = room.makeAction('bye')

    actionsRef.current = { sendProfile, sendChat, sendMusic, sendBye }

    getProfile((data, peerId) => {
      setPeers((prev) => ({ ...prev, [peerId]: data }))
    })

    getChat((data) => {
      setMessages((prev) => [...prev, data])
      playMessageSound()
    })

    getMusic((data) => {
      setMusicState(data)
    })

    getBye((_, peerId) => {
      // participante avisou que está saindo intencionalmente (mesma coisa
      // que onPeerLeave cobre, mantido por clareza/possível uso futuro)
    })

    room.onPeerJoin((peerId) => {
      sendProfile(profile, peerId)
      playJoinSound()
      setConnected(true)
    })

    room.onPeerLeave((peerId) => {
      setPeers((prev) => {
        const next = { ...prev }
        delete next[peerId]
        return next
      })
      setCameraStreams((prev) => {
        const next = { ...prev }
        delete next[peerId]
        return next
      })
      setScreenStreams((prev) => {
        const next = { ...prev }
        delete next[peerId]
        return next
      })
      playLeaveSound()
    })

    room.onPeerStream((stream, peerId, metadata) => {
      if (metadata?.type === 'screen') {
        setScreenStreams((prev) => ({ ...prev, [peerId]: stream }))
      } else {
        setCameraStreams((prev) => ({ ...prev, [peerId]: stream }))
      }
    })

    return () => {
      try {
        actionsRef.current.sendBye?.({})
        room.leave()
      } catch {}
      roomRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode])

  // Reenvia o perfil se ele mudar (ex: trocou de avatar no meio da call)
  useEffect(() => {
    if (roomRef.current && actionsRef.current.sendProfile) {
      actionsRef.current.sendProfile(profile)
    }
  }, [profile])

  const sendChatMessage = useCallback(
    (text) => {
      if (!text?.trim()) return
      const diceResult = rollDice(text)
      const msg = {
        id: Math.random().toString(36).slice(2),
        senderId: selfId.current,
        name: profile.name,
        avatar: profile.avatar,
        text: text.trim(),
        time: Date.now(),
        dice: diceResult
      }
      setMessages((prev) => [...prev, msg])
      actionsRef.current.sendChat?.(msg)
      if (diceResult) playDiceSound()
    },
    [profile]
  )

  const broadcastMusic = useCallback((state) => {
    const payload = { ...state, updatedAt: Date.now() }
    setMusicState(payload)
    actionsRef.current.sendMusic?.(payload)
  }, [])

  // Garante que o microfone (voz) esteja ativo desde o início, mesmo
  // com a câmera desligada. Chamar uma vez ao entrar na sala.
  const initVoice = useCallback(async () => {
    if (localCameraStream) return localCameraStream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      setLocalCameraStream(stream)
      roomRef.current?.addStream(stream, null, { type: 'camera' })
      return stream
    } catch (e) {
      console.warn('Sem permissão de microfone', e)
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Liga a câmera "trocando" o stream atual (só-áudio) por um com vídeo,
  // sem derrubar a chamada de voz.
  const startCamera = useCallback(
    async (constraints) => {
      const newStream = await navigator.mediaDevices.getUserMedia(
        constraints || { video: true, audio: true }
      )
      const old = localCameraStream
      roomRef.current?.addStream(newStream, null, { type: 'camera' })
      if (old) {
        roomRef.current?.removeStream(old)
        old.getTracks().forEach((t) => t.stop())
      }
      setLocalCameraStream(newStream)
      setCamEnabled(true)
      return newStream
    },
    [localCameraStream]
  )

  // Desliga a câmera voltando para um stream só de áudio (mantém a voz).
  const stopCamera = useCallback(async () => {
    const old = localCameraStream
    try {
      const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      roomRef.current?.addStream(audioOnly, null, { type: 'camera' })
      if (old) {
        roomRef.current?.removeStream(old)
        old.getTracks().forEach((t) => t.stop())
      }
      setLocalCameraStream(audioOnly)
    } catch (e) {
      console.warn(e)
    }
    setCamEnabled(false)
  }, [localCameraStream])

  const startScreenShare = useCallback(async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
    setLocalScreenStream(stream)
    roomRef.current?.addStream(stream, null, { type: 'screen' })
    // Se a pessoa parar de compartilhar pelo próprio navegador (botão nativo)
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      stopScreenShare()
    })
    return stream
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopScreenShare = useCallback(() => {
    setLocalScreenStream((old) => {
      if (old) {
        roomRef.current?.removeStream(old)
        old.getTracks().forEach((t) => t.stop())
      }
      return null
    })
  }, [])

  const toggleMic = useCallback(() => {
    setMicEnabled((prev) => {
      const next = !prev
      localCameraStream?.getAudioTracks().forEach((t) => (t.enabled = next))
      return next
    })
  }, [localCameraStream])

  const replaceCameraStream = useCallback(
    async (constraints) => {
      const oldStream = localCameraStream
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      if (oldStream) {
        roomRef.current?.removeStream(oldStream)
        oldStream.getTracks().forEach((t) => t.stop())
      }
      roomRef.current?.addStream(newStream, null, { type: 'camera' })
      setLocalCameraStream(newStream)
      return newStream
    },
    [localCameraStream]
  )

  const leaveRoom = useCallback(() => {
    localCameraStream?.getTracks().forEach((t) => t.stop())
    localScreenStream?.getTracks().forEach((t) => t.stop())
    try {
      actionsRef.current.sendBye?.({})
      roomRef.current?.leave()
    } catch {}
  }, [localCameraStream, localScreenStream])

  return (
    <RoomContext.Provider
      value={{
        selfId: selfId.current,
        peers,
        cameraStreams,
        screenStreams,
        messages,
        musicState,
        connected,
        joining,
        localCameraStream,
        localScreenStream,
        micEnabled,
        camEnabled,
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
      }}
    >
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error('useRoom precisa estar dentro de RoomProvider')
  return ctx
}
