// Extrai o ID de vídeo de vários formatos de link do YouTube
export function extractYouTubeId(url) {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  // Se já for só o ID (11 chars típicos)
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim()
  return null
}

let apiPromise = null

// Carrega o script da IFrame API do YouTube dinamicamente (uma única vez)
export function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT)
    }
  })

  return apiPromise
}
