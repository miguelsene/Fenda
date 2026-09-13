// Gera efeitos sonoros simples via Web Audio API, sem precisar de arquivos
// .mp3 externos (evita depender de qualquer coisa hospedada).

let ctx = null
function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freqStart, freqEnd, duration = 0.25, type = 'sine', gain = 0.15 }) {
  try {
    const audioCtx = getCtx()
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(freqEnd, 1),
      audioCtx.currentTime + duration
    )
    gainNode.gain.setValueAtTime(gain, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  } catch (e) {
    // ambiente sem suporte a áudio; ignora silenciosamente
  }
}

export function playJoinSound() {
  tone({ freqStart: 320, freqEnd: 620, duration: 0.22, type: 'triangle', gain: 0.12 })
}

export function playLeaveSound() {
  tone({ freqStart: 500, freqEnd: 180, duration: 0.28, type: 'triangle', gain: 0.12 })
}

export function playDiceSound() {
  tone({ freqStart: 800, freqEnd: 400, duration: 0.12, type: 'square', gain: 0.08 })
}

export function playMessageSound() {
  tone({ freqStart: 700, freqEnd: 900, duration: 0.08, type: 'sine', gain: 0.06 })
}
