// Tudo é salvo localmente no navegador (localStorage). Nada é enviado
// para nenhum servidor. Isso significa que a "conta" só existe nesse
// navegador/dispositivo específico.

const ACCOUNT_KEY = 'toonmeet_account'
const DEVICE_PREFS_KEY = 'toonmeet_device_prefs'
const RECENT_ROOMS_KEY = 'toonmeet_recent_rooms'
const GUEST_PROFILE_KEY = 'toonmeet_guest_profile'

export function getAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveAccount(account) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
}

export function clearAccount() {
  localStorage.removeItem(ACCOUNT_KEY)
}

export function getDevicePrefs() {
  try {
    const raw = localStorage.getItem(DEVICE_PREFS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveDevicePrefs(prefs) {
  const current = getDevicePrefs()
  localStorage.setItem(DEVICE_PREFS_KEY, JSON.stringify({ ...current, ...prefs }))
}

export function getRecentRooms() {
  try {
    const raw = localStorage.getItem(RECENT_ROOMS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentRoom(code) {
  const rooms = getRecentRooms().filter((c) => c !== code)
  rooms.unshift(code)
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(rooms.slice(0, 8)))
}

export function getGuestProfile() {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveGuestProfile(profile) {
  localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile))
}

// Simples "hash" só para não guardar senha 100% em texto plano.
// AVISO: isso NÃO é segurança de verdade, é só ofuscação básica,
// já que todo o sistema roda sem backend.
export function simpleHash(text) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(36)
}
