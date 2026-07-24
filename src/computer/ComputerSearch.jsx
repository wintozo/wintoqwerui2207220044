import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { BackIcon, SearchIcon } from '../components/Icons.jsx'

const s = {
  layout: { display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text)', animation: 'fadeIn 0.3s ease' },
  sidebar: { width: '340px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader: { padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '22px', fontWeight: 800, letterSpacing: '-1px', color: 'var(--text)' },
  back: { padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text)', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition)' },
  content: { flex: 1, padding: '48px', overflowY: 'auto', maxWidth: '700px' },
  title: { fontSize: '24px', fontWeight: 800, marginBottom: '24px', animation: 'slideUp 0.4s ease' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' },
  searchIcon: { position: 'absolute', left: '16px', color: 'var(--text-secondary)', display: 'flex', pointerEvents: 'none' },
  searchBar: { width: '100%', padding: '14px 18px 14px 46px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', color: 'var(--text)', fontSize: '16px', transition: 'border-color var(--transition)' },
  results: { display: 'flex', flexDirection: 'column', gap: '6px' },
  userItem: { display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '14px', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', transition: 'border-color var(--transition)', animation: 'slideUp 0.3s ease backwards' },
  avatar: { width: '46px', height: '46px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', flexShrink: 0 },
  userInfo: { flex: 1 },
  userName: { fontWeight: 600, fontSize: '15px' },
  userUsername: { fontSize: '13px', color: 'var(--text-secondary)' },
  startBtn: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'var(--accent-text)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none' },
  empty: { color: 'var(--text-secondary)', fontSize: '15px', textAlign: 'center', padding: '40px' }
}

export default function ComputerSearch() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const device = 'computer'

  async function handleSearch(val) {
    setQuery(val)
    if (val.length < 2) { setResults([]); return }
    setLoading(true)
    const { data } = await supabase.from('wintozo_users').select('*').neq('username', user?.username || '').ilike('username', `${val}%`).limit(30)
    setResults(data || [])
    setLoading(false)
  }

  async function handleUserClick(target) {
    await supabase.rpc('find_or_create_chat', { user_a: user.username, user_b: target.username })
    navigate(`/messenger/${device}/chat`)
  }

  return (
    <div style={s.layout}>
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.logo}>Wintozo</div>
          <div style={s.back} onClick={() => navigate(`/messenger/${device}/chat`)}><BackIcon size={18} /></div>
        </div>
      </div>
      <div style={s.content}>
        <div style={s.title}>Поиск пользователей</div>
        <div style={s.searchWrap}>
          <div style={s.searchIcon}><SearchIcon size={20} /></div>
          <input style={s.searchBar} placeholder="Введи @username для поиска..." value={query} onChange={(e) => handleSearch(e.target.value)} autoFocus />
        </div>
        <div style={s.results}>
          {loading ? (
            <div style={s.empty}>Поиск...</div>
          ) : results.length === 0 && query.length >= 2 ? (
            <div style={s.empty}>Пользователи не найдены</div>
          ) : query.length < 2 ? (
            <div style={s.empty}>Введи минимум 2 символа</div>
          ) : (
            results.map((user, i) => (
              <div key={user.id} style={{ ...s.userItem, animationDelay: `${i * 0.03}s` }} onClick={() => handleUserClick(user)}>
                <div style={s.avatar}>{user.nickname?.[0]?.toUpperCase() || '?'}</div>
                <div style={s.userInfo}>
                  <div style={s.userName}>{user.nickname}</div>
                  <div style={s.userUsername}>@{user.username}</div>
                </div>
                <button style={s.startBtn} onClick={(e) => { e.stopPropagation(); handleUserClick(user) }}>Чат</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}