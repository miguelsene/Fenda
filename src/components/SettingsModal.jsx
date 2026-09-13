import { useState } from 'react'
import { useMediaDevices } from '../hooks/useMediaDevices'
import { getDevicePrefs, saveDevicePrefs } from '../lib/storage'
import { useTheme } from '../context/ThemeContext'

export default function SettingsModal({ onClose, onApplyCamera }) {
  const { devices, refresh } = useMediaDevices()
  const prefs = getDevicePrefs()
  const [audioInput, setAudioInput] = useState(prefs.audioInputId || '')
  const [audioOutput, setAudioOutput] = useState(prefs.audioOutputId || '')
  const [videoInput, setVideoInput] = useState(prefs.videoInputId || '')
  const [applying, setApplying] = useState(false)

  async function handleSave() {
    setApplying(true)
    saveDevicePrefs({
      audioInputId: audioInput,
      audioOutputId: audioOutput,
      videoInputId: videoInput
    })

    try {
      await onApplyCamera?.({
        video: videoInput ? { deviceId: { exact: videoInput } } : true,
        audio: audioInput ? { deviceId: { exact: audioInput } } : true
      })

      // Tenta aplicar saída de áudio (nem todo navegador suporta setSinkId)
      if (audioOutput) {
        document.querySelectorAll('video, audio').forEach((el) => {
          if (el.setSinkId) el.setSinkId(audioOutput).catch(() => {})
        })
      }
    } finally {
      setApplying(false)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="toon-panel modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="bi bi-gear" style={{marginRight:8}}></i>Configurações</h3>
          <button className="toon-btn" onClick={onClose}><i className="bi bi-x-lg"></i></button>
        </div>

        <label className="settings-field">
          <span><i className="bi bi-mic-fill" style={{marginRight:8}}></i>Microfone (entrada de áudio)</span>
          <select className="toon-input" value={audioInput} onChange={(e) => setAudioInput(e.target.value)} onFocus={refresh}>
            <option value="">Padrão do sistema</option>
            {devices.audioInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || 'Microfone sem nome'}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-field">
          <span><i className="bi bi-volume-up" style={{marginRight:8}}></i>Saída de áudio (alto-falante/fone)</span>
          <select className="toon-input" value={audioOutput} onChange={(e) => setAudioOutput(e.target.value)} onFocus={refresh}>
            <option value="">Padrão do sistema</option>
            {devices.audioOutputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || 'Saída sem nome'}
              </option>
            ))}
          </select>
          <small>Pode não funcionar em todos os navegadores (ex: Firefox, Safari).</small>
        </label>

        <label className="settings-field">
          <span><i className="bi bi-camera-video-fill" style={{marginRight:8}}></i>Câmera</span>
          <select className="toon-input" value={videoInput} onChange={(e) => setVideoInput(e.target.value)} onFocus={refresh}>
            <option value="">Padrão do sistema</option>
            {devices.videoInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || 'Câmera sem nome'}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          <button className="toon-btn" onClick={onClose}>Cancelar</button>
          <button className="toon-btn primary" onClick={handleSave} disabled={applying}>
            {applying ? 'Aplicando...' : 'Salvar e aplicar'}
          </button>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6}}>
          <div style={{fontWeight:700}}>Tema</div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button className="toon-btn" onClick={toggleTheme} style={{display:'flex',alignItems:'center',gap:8}}>
      <i className={theme === 'light' ? 'bi bi-sun' : 'bi bi-moon'}></i>
      {theme === 'light' ? 'Claro' : 'Escuro'}
    </button>
  )
}
