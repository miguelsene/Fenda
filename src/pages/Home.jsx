import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../context/AccountContext'
import Avatar from '../components/Avatar'
import { generateRoomCode, normalizeRoomCode } from '../lib/roomCode'
import { getRecentRooms } from '../lib/storage'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Home() {
  const { account, signup, login, logout, activeProfile, setGuestProfile } = useAccount()
  const navigate = useNavigate()

  const [mode, setMode] = useState('guest') // 'guest' | 'login' | 'signup'
  const [guestName, setGuestName] = useState(activeProfile?.name || '')
  const [guestAvatar, setGuestAvatar] = useState(activeProfile?.avatar || null)

  const [form, setForm] = useState({ name: '', email: '', password: '', avatar: null })
      const [authError, setAuthError] = useState('')

  const [joinCode, setJoinCode] = useState('')
  const recentRooms = getRecentRooms()
  const location = useLocation()

  useEffect(() => {
    // If redirected from a room link, prefill the join code
    if (location?.state?.toJoin) {
      setJoinCode(location.state.toJoin)
      setMode('guest')
    }
  }, [location])

  async function handleAvatarPick(e, target) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    if (target === 'guest') setGuestAvatar(dataUrl)
    else setForm((f) => ({ ...f, avatar: dataUrl }))
  }

  function ensureProfileSaved() {
    if (!account) {
      setGuestProfile({ name: guestName.trim() || 'Convidado', avatar: guestAvatar })
    }
  }

  function handleCreateRoom() {
    if (!activeProfile && !guestName.trim()) {
          alert('Digite um nome antes de criar a sala')
      return
    }
    ensureProfileSaved()
    const code = generateRoomCode()
    navigate(`/room/${code}`)
  }

  function handleJoinRoom(e) {
    e.preventDefault()
    if (!activeProfile && !guestName.trim()) {
          alert('Digite um nome antes de entrar na sala')
      return
    }
    const code = normalizeRoomCode(joinCode)
    if (!code) return
    ensureProfileSaved()
    navigate(`/room/${code}`)
  }

  function handleSignup(e) {
    e.preventDefault()
    setAuthError('')
    if (!form.name || !form.email || !form.password) {
      setAuthError('Preencha nome, e-mail e senha.')
      return
    }
    signup(form)
    setMode('guest')
  }

  function handleLogin(e) {
    e.preventDefault()
    setAuthError('')
    const result = login(form)
    if (!result.ok) setAuthError(result.error)
    else setMode('guest')
  }

  return (
    <div className="home-page">
        <div className="home-hero">
          <img src="/nex.png" alt="Nex" style={{height:72, marginBottom:12}} onError={(e)=>{e.target.style.display='none'}} />
          <h1 className="app-title">Nex</h1>
          <p className="app-subtitle">Chamadas em grupo, música e diversão — pronto para jogar.</p>
        </div>

      <div className="home-grid">
        {/* Cartão de perfil / login */}
        <div className="toon-panel home-card">
          {account ? (
            <div className="profile-box">
              <Avatar name={account.name} src={account.avatar} size={64} />
              <div>
                <strong>{account.name}</strong>
                <div className="muted-text">{account.email}</div>
              </div>
              <button className="toon-btn" onClick={logout}>Sair da conta</button>
            </div>
          ) : mode === 'guest' ? (
            <>
              <h3>Entrar como convidado</h3>
              <label className="settings-field">
                <span>Seu nome</span>
                <input
                  className="toon-input"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Como quer aparecer nas chamadas?"
                />
              </label>
              <label className="settings-field">
                <span>Foto (opcional)</span>
                <div className="avatar-picker">
                  <Avatar name={guestName} src={guestAvatar} size={56} />
                  <input type="file" accept="image/*" onChange={(e) => handleAvatarPick(e, 'guest')} />
                </div>
              </label>
              <div className="home-card-links">
                <button className="link-btn" onClick={() => setMode('signup')}>Criar conta</button>
                <button className="link-btn" onClick={() => setMode('login')}>Já tenho conta</button>
              </div>
            </>
          ) : mode === 'signup' ? (
            <form onSubmit={handleSignup}>
              <h3>Criar conta</h3>
              <label className="settings-field">
                <span>Nome</span>
                <input className="toon-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="settings-field">
                <span>E-mail</span>
                <input className="toon-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="settings-field">
                <span>Senha</span>
                <input className="toon-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
              <label className="settings-field">
                <span>Foto de perfil (opcional)</span>
                <div className="avatar-picker">
                  <Avatar name={form.name} src={form.avatar} size={56} />
                  <input type="file" accept="image/*" onChange={(e) => handleAvatarPick(e, 'account')} />
                </div>
              </label>
              {authError && <div className="form-error">{authError}</div>}
              <div className="home-card-links">
                <button className="toon-btn primary" type="submit">Criar conta</button>
                <button className="link-btn" type="button" onClick={() => setMode('guest')}>Voltar</button>
              </div>
              <small className="muted-text">
                A conta fica salva só neste navegador (localStorage) — não há servidor guardando seus dados.
              </small>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <h3>Entrar na conta</h3>
              <label className="settings-field">
                <span>E-mail</span>
                <input className="toon-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="settings-field">
                <span>Senha</span>
                <input className="toon-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
              {authError && <div className="form-error">{authError}</div>}
              <div className="home-card-links">
                <button className="toon-btn primary" type="submit">Entrar</button>
                <button className="link-btn" type="button" onClick={() => setMode('guest')}>Voltar</button>
              </div>
            </form>
          )}
        </div>

        {/* Cartão de sala */}
        <div className="toon-panel home-card">
          <h3>Iniciar ou entrar em uma chamada</h3>
          <button className="toon-btn primary big-btn" onClick={handleCreateRoom}>
            <i className="bi bi-plus-lg" style={{marginRight:8}}></i>Criar nova sala
          </button>

          <div className="divider">ou</div>

          <form onSubmit={handleJoinRoom} className="join-form">
            <input
              className="toon-input"
              placeholder="Código da sala (ex: X7K2QP)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button className="toon-btn" type="submit">Entrar</button>
          </form>

          {recentRooms.length > 0 && (
            <div className="recent-rooms">
              <span className="muted-text">Salas recentes:</span>
              <div className="recent-rooms-list">
                {recentRooms.map((code) => (
                  <button key={code} className="chip-btn" onClick={() => navigate(`/room/${code}`)}>
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
