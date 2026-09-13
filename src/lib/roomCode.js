const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem letras/números ambíguos

export function generateRoomCode(length = 6) {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

export function normalizeRoomCode(code) {
  return (code || '').trim().toUpperCase().replace(/\s+/g, '')
}
