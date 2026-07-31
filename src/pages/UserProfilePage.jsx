import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { BackIcon, CrownIcon } from '../components/Icons.jsx'

const s = {
  container: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', color: 'var(--text)' },
  header: { padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', flexShrink: 0 },
  backBtn: { padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: 800, fontSize: '17px', flex: 1 },
  body: { flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' },
  avatarLarge: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-accent)' },
  avatarFallback: { width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '40px', boxShadow: 'var(--shadow-accent)' },
  infoCard: { background: 'var(--bg-secondary)', borderRadius: '16px', padding: '20px', width: '100%', border: '1px solid var(--border)' },
  label: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' },
  value: { fontSize: '16px', fontWeight: 600 },
  proBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(245,158,11,0.15)', borderRadius: '20px', fontSize: '13px', fontWeight: 700, color: '#f59e0b' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' },
  spinner: { width: '32px', height: '32px', border: '3px solid var(--border)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }
}

export default function UserProfilePage() {
  const navigate = useNavigate()
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [proActive, setProActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      const { data: user } = await supabase
        .from('wintozo_users')
        .select('*')
        .eq('username', username)
        .single()

      if (user) {
        setProfile(user)
        
        const { data: pro } = await supabase
          .rpc('get_pro_status', { p_username: username })
        setProActive(pro?.active || false)
      }
    } catch (err) {
      console.error('Load profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderAvatar = (u, size = '100px') => {
    if (u?.avatar_url) {
      return <img src={u.avatar_url} alt="" style={{ ...s.avatarLarge, width: size, height: size }} />
    }
    if (u?.avatar) {
      return <div style={{ ...s.avatarFallback, width: size, height: size, fontSize: size === '100px' ? '40px' : '18px' }}>{u.avatar}</div>
    }
    return <div style={{ ...s.avatarFallback, width: size, height: size, fontSize: size === '100px' ? '40px' : '18px' }}>{(u?.nickname || '?')[0]?.toUpperCase()}</div>
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Неизвестно'
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => {
            const isComputer = window.location.pathname.includes('computer')
            navigate(isComputer ? '/messenger/computer/chat' : '/messenger/phone/chat')
          }}>
            <BackIcon size={20} />
          </button>
          <div style={s.title}>Профиль</div>
        </div>
        <div style={s.loadingContainer}>
          <div style={s.spinner} />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <BackIcon size={20} />
          </button>
          <div style={s.title}>Профиль</div>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Пользователь не найден
        </div>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => {
          const isComputer = window.location.pathname.includes('computer')
          navigate(isComputer ? '/messenger/computer/chat' : '/messenger/phone/chat')
        }}>
          <BackIcon size={20} />
        </button>
        <div style={s.title}>Профиль</div>
      </div>

      <div style={s.body}>
        {/* Аватар */}
        <div style={{ textAlign: 'center' }}>
          {renderAvatar(profile)}
        </div>

        {/* Статус Pro */}
        <div style={{ textAlign: 'center' }}>
          {proActive ? (
            <div style={s.proBadge}>
              <CrownIcon size={14} /> Wintozo Pro
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Без подписки Pro
            </div>
          )}
        </div>

        {/* Информация */}
        <div style={s.infoCard}>
          <div style={{ marginBottom: '16px' }}>
            <div style={s.label}>Никнейм</div>
            <div style={s.value}>{profile.nickname || '-'}</div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={s.label}>Юзернейм</div>
            <div style={s.value}>@{profile.username || '-'}</div>
          </div>

          <div>
            <div style={s.label}>В Wintozo с</div>
            <div style={s.value}>{formatDate(profile.created_at)}</div>
          </div>
        </div>

        {/* Бейдж */}
        {profile.current_badge && (
          <div style={s.infoCard}>
            <div style={s.label}>Бейдж</div>
            <div style={{ fontSize: '32px', marginTop: '8px' }}>{profile.current_badge}</div>
          </div>
        )}
      </div>
    </div>
  )
}
