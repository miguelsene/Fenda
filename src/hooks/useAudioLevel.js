import { useEffect, useRef, useState } from 'react'

// Analisa um MediaStream e retorna `true` enquanto o volume detectado
// estiver acima do limiar (usado para destacar quem está falando).
export function useAudioLevel(stream, threshold = 0.06) {
  const [speaking, setSpeaking] = useState(false)
  const rafRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setSpeaking(false)
      return
    }

    let cancelled = false
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const audioCtx = new AudioCtx()
    ctxRef.current = audioCtx

    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.6
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)

    let aboveSince = 0
    let belowSince = 0

    const tick = () => {
      if (cancelled) return
      analyser.getByteFrequencyData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) sum += data[i]
      const avg = sum / data.length / 255

      const now = performance.now()
      if (avg > threshold) {
        aboveSince = aboveSince || now
        belowSince = 0
        if (now - aboveSince > 80) setSpeaking(true)
      } else {
        belowSince = belowSince || now
        aboveSince = 0
        if (now - belowSince > 250) setSpeaking(false)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      try {
        source.disconnect()
        analyser.disconnect()
        audioCtx.close()
      } catch {}
    }
  }, [stream, threshold])

  return speaking
}
