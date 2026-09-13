import { useCallback, useEffect, useState } from 'react'

export function useMediaDevices() {
  const [devices, setDevices] = useState({ audioInputs: [], audioOutputs: [], videoInputs: [] })

  const refresh = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices()
      setDevices({
        audioInputs: list.filter((d) => d.kind === 'audioinput'),
        audioOutputs: list.filter((d) => d.kind === 'audiooutput'),
        videoInputs: list.filter((d) => d.kind === 'videoinput')
      })
    } catch (e) {
      console.warn('Não foi possível listar dispositivos', e)
    }
  }, [])

  useEffect(() => {
    refresh()
    navigator.mediaDevices?.addEventListener?.('devicechange', refresh)
    return () => navigator.mediaDevices?.removeEventListener?.('devicechange', refresh)
  }, [refresh])

  return { devices, refresh }
}
