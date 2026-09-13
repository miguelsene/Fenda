import { createContext, useContext, useState, useCallback } from 'react'
import { getAccount, saveAccount, clearAccount, simpleHash, getGuestProfile, saveGuestProfile } from '../lib/storage'

const AccountContext = createContext(null)

export function AccountProvider({ children }) {
  const [account, setAccount] = useState(() => getAccount())
  // "guest" é usado quando a pessoa só digita um nome na home, sem criar conta
  const [guestProfile, setGuestProfileState] = useState(() => getGuestProfile())

  const setGuestProfile = (profile) => {
    setGuestProfileState(profile)
    if (profile) saveGuestProfile(profile)
  }

  const signup = useCallback(({ name, email, password, avatar }) => {
    const newAccount = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: simpleHash(password),
      avatar: avatar || null,
      createdAt: Date.now()
    }
    saveAccount(newAccount)
    setAccount(newAccount)
    return newAccount
  }, [])

  const login = useCallback(({ email, password }) => {
    const stored = getAccount()
    if (!stored) return { ok: false, error: 'Nenhuma conta encontrada nesse navegador.' }
    if (stored.email !== email.trim().toLowerCase()) {
      return { ok: false, error: 'E-mail não encontrado.' }
    }
    if (stored.passwordHash !== simpleHash(password)) {
      return { ok: false, error: 'Senha incorreta.' }
    }
    setAccount(stored)
    return { ok: true, account: stored }
  }, [])

  const updateProfile = useCallback((patch) => {
    setAccount((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...patch }
      saveAccount(updated)
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    clearAccount()
    setAccount(null)
  }, [])

  // Perfil ativo: conta de verdade tem prioridade, senão o perfil convidado
  const activeProfile = account
    ? { name: account.name, avatar: account.avatar, isGuest: false }
    : guestProfile
      ? { ...guestProfile, isGuest: true }
      : null

  return (
    <AccountContext.Provider
      value={{
        account,
        signup,
        login,
        logout,
        updateProfile,
        guestProfile,
        setGuestProfile,
        activeProfile
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount precisa estar dentro de AccountProvider')
  return ctx
}
