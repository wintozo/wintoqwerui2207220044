import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'wintozo_salt_2026')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regData, setRegData] = useState({ nickname: '', username: '', password: '' })
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const saved = localStorage.getItem('wintozo_username')
    if (saved) {
      const timeout = setTimeout(() => {
        setLoading(false)
      }, 5000)

      supabase
        .from('wintozo_users')
        .select('*')
        .eq('username', saved)
        .single()
        .then(({ data, error }) => {
          if (error || !data || data.banned) {
            localStorage.removeItem('wintozo_username')
            setLoading(false)
            return
          }
          setUser(data)
          setLoading(false)
        })
        .catch(() => {
          localStorage.removeItem('wintozo_username')
          setLoading(false)
        })
        .finally(() => {
          clearTimeout(timeout)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  async function signUp(nickname, username, password) {
    const trimmedUsername = username.trim().toLowerCase()
    const trimmedNickname = nickname.trim()
    const passwordHash = await hashPassword(password)

    const { data: existing } = await supabase
      .from('wintozo_users')
      .select('*')
      .eq('username', trimmedUsername)
      .single()

    if (existing) {
      return { error: { message: 'Этот юзернейм уже занят' } }
    }

    const { data, error } = await supabase
      .from('wintozo_users')
      .insert({
        username: trimmedUsername,
        nickname: trimmedNickname,
        password_hash: passwordHash
      })
      .select()
      .single()

    if (error) return { error }

    localStorage.setItem('wintozo_username', trimmedUsername)
    setUser(data)
    return { data }
  }

  async function signIn(username, password) {
    const trimmedUsername = username.trim().toLowerCase()
    const passwordHash = await hashPassword(password)

    const { data: existing } = await supabase
      .from('wintozo_users')
      .select('*')
      .eq('username', trimmedUsername)
      .single()

    if (!existing) {
      return { error: { message: 'Пользователь не найден' } }
    }

    if (existing.banned) {
      return { error: { message: 'Вы заблокированы' } }
    }

    if (existing.password_hash !== passwordHash) {
      return { error: { message: 'Неверный пароль' } }
    }

    localStorage.setItem('wintozo_username', trimmedUsername)
    setUser(existing)
    return { data: existing }
  }

  async function signOut() {
    localStorage.removeItem('wintozo_username')
    setUser(null)
  }

  const value = {
    user,
    loading,
    regData,
    setRegData,
    signUp,
    signIn,
    signOut,
    setUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
