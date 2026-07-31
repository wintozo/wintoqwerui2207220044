import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { BackIcon, SearchIcon } from '../components/Icons.jsx'

const s = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)', animation: 'fadeIn 0.5s ease' },
  header: { display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', gap: '10px', flexShrink: 0 },
  back: { padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text)', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition)' },
  title: { fontWeight: 700, fontSize: '17px' },
  searchWrap: { margin: '12px 16px', position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '14px', color: 'var(--text-secondary)', display: 'flex', pointerEvents: 'none' },
  searchBar: { width: '100%', padding: '12px 16px 12px 44px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', color: 'var(--text)', fontSize: '16px', transition: 'border-color var(--transition)' },
  results: { flex: 1, overflowY: 'auto', padding: '4px 0' },
  userItem: { display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', cursor: 'pointer', transition: 'background var(--transition), transform 0.2s ease', borderBottom: '1px solid var(--border)', animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards' },
  avatar: { width: '46px', height: '46px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', flexShrink: 0 },
  userInfo: { flex: 1 },
  userName: { fontWeight: 600, fontSize: '15px' },
  userUsername: { fontSize: '13px', color: 'var(--text-secondary)' },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '15px', padding: '32px', textAlign: 'center' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px' },
  loadingDots: { display: 'flex', gap: '6px', alignItems: 'center' },
  loadingDot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', animation: 'loadingDots 1.4s ease-in-out infinite' }
}

export default function MobileSearch() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const device = 'phone'

  async function handleSearch(val) {
    setQuery(val)
    if (val.length < 2) { setResults([]); return }
    setLoading(true)
    const { data } = await supabase.from('wintozo_users').select('*').neq('username', user?.username || '').ilike('username', `${val}%`).limit(20)
    setResults(data || [])
    setLoading(false)
  }

  async function handleUserClick(target) {
    await supabase.rpc('find_or_create_chat', { user_a: user.username, user_b: target.username })
    navigate(`/messenger/${device}/chat`)
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.back} onClick={() => navigate(`/messenger/${device}/chat`)}><BackIcon size={18} /></div>
        <div style={s.title}>Пользователи</div>
      </div>
      <div style={s.searchWrap}>
        <div style={s.searchIcon}><SearchIcon size={18} /></div>
        <input style={s.searchBar} placeholder="Поиск по @username..." value={query} onChange={(e) => handleSearch(e.target.value)} autoFocus />
      </div>
      <div style={s.results}>
        {loading ? (
          <div style={s.empty}>
            <div style={s.loadingContainer}>
              <div style={s.loadingDots}>
                <div style={s.loadingDot} />
                <div style={s.loadingDot} />
                <div style={s.loadingDot} />
              </div>
            </div>
          </div>
        ) : results.length === 0 && query.length >= 2 ? (
          <div style={s.empty}>Пользователи не найдены</div>
        ) : query.length < 2 ? (
          <div style={s.empty}>Введи минимум 2 символа</div>
        ) : (
          results.map((user, i) => (
            <div key={user.id} style={{ ...s.userItem, animationDelay: `${i * 0.05}s` }} onClick={() => handleUserClick(user)}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : user.avatar ? (
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{user.avatar}</div>
              ) : (
                <div style={s.avatar}>{user.nickname?.[0]?.toUpperCase() || '?'}</div>
              )}
              <div style={s.userInfo}>
                <div style={s.userName}>{user.nickname}</div>
                <div style={s.userUsername}>@{user.username}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}