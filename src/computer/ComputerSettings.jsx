import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { BackIcon, LogoutIcon, ImageIcon, TrophyIcon, CrownIcon, SparkleIcon } from '../components/Icons.jsx'
import AvatarPicker from '../components/AvatarPicker.jsx'

const s = {
  layout: { display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text)', animation: 'fadeIn 0.3s ease' },
  sidebar: { width: '340px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader: { padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '22px', fontWeight: 800, letterSpacing: '-1px', color: 'var(--text)' },
  back: { padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text)', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition)' },
  content: { flex: 1, padding: '48px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' },
  title: { fontSize: '24px', fontWeight: 800, animation: 'slideUp 0.4s ease' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px', animation: 'slideUp 0.4s ease 0.05s backwards' },
  sectionTitle: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 },
  profileInfo: { background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' },
  profileRow: { display: 'flex', flexDirection: 'column', gap: '4px' },
  profileLabel: { fontSize: '12px', color: 'var(--text-secondary)' },
  profileValue: { fontSize: '16px', fontWeight: 600 },
  themeGrid: { display: 'flex', gap: '12px' },
  themeOption: { flex: 1, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all var(--transition)' },
  themeActive: { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-glow)' },
  themeName: { fontWeight: 600, fontSize: '14px' },
  logout: { marginTop: 'auto', padding: '15px', background: 'transparent', border: '1.5px solid var(--error)', color: 'var(--error)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all var(--transition)' }
}

export default function ComputerSettings() {
  const navigate = useNavigate()
  const { user, signOut, setUser } = useAuth()
  const [theme, setTheme] = useState(localStorage.getItem('wintozo_theme') || 'light')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [proActive, setProActive] = useState(false)
  const [proLoading, setProLoading] = useState(true)
  const device = 'computer'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('wintozo_theme', theme)
  }, [theme])

  useEffect(() => {
    const username = localStorage.getItem('wintozo_username')
    if (!username) return
    loadProStatus(username)
  }, [])

  const loadProStatus = async (username) => {
    try {
      const { data } = await supabase.rpc('get_pro_status', { p_username: username })
      setProActive(data?.active || false)
    } catch (err) {
      console.error('Pro status error:', err)
    } finally {
      setProLoading(false)
    }
  }

  function handleLogout() {
    signOut()
    localStorage.removeItem('wintozo_device')
    navigate('/messenger/registration/username')
  }

  function handleAvatarChange(avatar) {
    if (user) {
      setUser({ ...user, ...avatar })
    }
  }

  const renderAvatar = (user, size = '80px') => {
    if (user?.avatar_url) {
      return <img src={user.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    }
    if (user?.avatar) {
      return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>{user.avatar}</div>
    }
    return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '36px' }}>{(user?.nickname || '?')[0]?.toUpperCase()}</div>
  }

  const themes = [
    { id: 'light', name: 'Светлая', color: '#3b82f6' },
    { id: 'dark', name: 'Тёмная', color: '#8b5cf6' },
    { id: 'midnight', name: 'Полночь', color: '#06b6d4' },
    { id: 'sunset', name: 'Закат', color: '#f97316' }
  ]

  return (
    <div style={s.layout}>
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.logo}>Wintozo</div>
          <div style={s.back} onClick={() => navigate(`/messenger/${device}/chat`)}><BackIcon size={18} /></div>
        </div>
      </div>
      <div style={s.content}>
        <div style={s.title}>Настройки</div>
        <div style={s.section}>
          <div style={s.sectionTitle}>ПРОФИЛЬ</div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div onClick={() => setShowAvatarPicker(true)} style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}>
              {renderAvatar(user)}
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--bg)'
              }}>
                <ImageIcon size={16} />
              </div>
            </div>
          </div>
          <div style={s.profileInfo}>
            <div style={s.profileRow}>
              <div style={s.profileLabel}>Никнейм</div>
              <div style={s.profileValue}>{user?.nickname || '-'}</div>
            </div>
            <div style={{ ...s.profileRow, marginTop: '16px' }}>
              <div style={s.profileLabel}>Юзернейм</div>
              <div style={s.profileValue}>@{user?.username || '-'}</div>
            </div>
            {user?.current_badge && (
              <div style={{ ...s.profileRow, marginTop: '16px' }}>
                <div style={s.profileLabel}>Бейдж</div>
                <div style={{ fontSize: '28px', marginTop: '4px' }}>{user.current_badge}</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ ...s.section, animationDelay: '0.1s' }}>
          <div style={s.sectionTitle}>ТЕМА</div>
          <div style={s.themeGrid}>
            {themes.map((t) => (
              <div key={t.id} style={{ ...s.themeOption, ...(theme === t.id ? s.themeActive : {}) }} onClick={() => setTheme(t.id)}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.color, border: '2px solid var(--border)' }} />
                <div style={s.themeName}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={s.section}>
          <div style={s.sectionTitle}>ИГРЫ</div>
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => navigate('/messenger/battle')}>
            <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrophyIcon size={20} /> Битва смайликов
            </div>
            <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>›</div>
          </div>
        </div>
        <div style={s.section}>
          <div style={s.sectionTitle}>ПРО</div>
          <div style={{ padding: '16px', background: proActive ? 'rgba(245,158,11,0.08)' : 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: `1px solid ${proActive ? '#f59e0b' : 'var(--border)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => navigate('/messenger/status/pro')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CrownIcon size={20} style={{ color: '#f59e0b' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>Wintozo Pro</div>
                <div style={{ fontSize: '12px', color: proActive ? '#f59e0b' : 'var(--text-secondary)' }}>
                  {proLoading ? 'Загрузка...' : proActive ? 'Активен' : 'Неактивен'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {proActive && <SparkleIcon size={18} style={{ color: '#f59e0b' }} />}
              <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>›</div>
            </div>
          </div>
          {proActive && (
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => navigate('/messenger/settings/pro-customize')}>
              <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SparkleIcon size={18} style={{ color: '#f59e0b' }} /> Использовать возможности Wintozo-Pro
              </div>
              <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>›</div>
            </div>
          )}
        </div>
        <div style={{ ...s.logout, animation: 'slideUp 0.4s ease 0.15s backwards' }} onClick={handleLogout}><LogoutIcon size={18} /> Выйти из аккаунта</div>
      </div>
      {showAvatarPicker && <AvatarPicker currentAvatar={user?.avatar ? { type: 'emoji', value: user.avatar } : user?.avatar_url ? { type: 'url', value: user.avatar_url } : null} onSelect={handleAvatarChange} onClose={() => setShowAvatarPicker(false)} />}
    </div>
  )
}