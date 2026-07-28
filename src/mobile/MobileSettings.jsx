import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { BackIcon, LogoutIcon, ImageIcon, TrophyIcon, CrownIcon, SparkleIcon } from '../components/Icons.jsx'
import AvatarPicker from '../components/AvatarPicker.jsx'

const s = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)', animation: 'fadeIn 0.3s ease' },
  header: { display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', gap: '10px', flexShrink: 0 },
  back: { padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text)', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition)' },
  title: { fontWeight: 700, fontSize: '17px' },
  body: { flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px', animation: 'slideUp 0.4s ease backwards' },
  sectionTitle: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 },
  profileInfo: { background: 'var(--bg-secondary)', padding: '18px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' },
  profileLabel: { fontSize: '12px', color: 'var(--text-secondary)' },
  profileValue: { fontSize: '16px', fontWeight: 600, marginTop: '4px' },
  themeOption: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', cursor: 'pointer', transition: 'border-color var(--transition)' },
  themeName: { fontWeight: 600, fontSize: '15px' },
  themeDot: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border)', transition: 'all var(--transition)' },
  themeActive: { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-glow)' },
  logout: { marginTop: 'auto', padding: '15px', background: 'transparent', border: '1.5px solid var(--error)', color: 'var(--error)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all var(--transition)' }
}

export default function MobileSettings() {
  const navigate = useNavigate()
  const { user, signOut, setUser } = useAuth()
  const [theme, setTheme] = useState(localStorage.getItem('wintozo_theme') || 'light')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [proActive, setProActive] = useState(false)
  const [proLoading, setProLoading] = useState(true)
  const device = 'phone'

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

  const renderAvatar = (u, size = '46px') => {
    // Если аватар ещё не загружен (SQL не выполнен) — показываем букву
    const avatar = u?.avatar
    const avatar_url = u?.avatar_url
    if (avatar_url) {
      return <img src={avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    }
    if (avatar) {
      return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size === '46px' ? '18px' : '36px' }}>{avatar}</div>
    }
    return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size === '46px' ? '18px' : '36px' }}>{(u?.nickname || '?')[0]?.toUpperCase()}</div>
  }

  const themes = [
    { id: 'light', name: 'Светлая', color: '#3b82f6' },
    { id: 'dark', name: 'Тёмная', color: '#8b5cf6' },
    { id: 'midnight', name: 'Полночь', color: '#06b6d4' },
    { id: 'sunset', name: 'Закат', color: '#f97316' }
  ]

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.back} onClick={() => navigate(`/messenger/${device}/chat`)}><BackIcon size={18} /></div>
        <div style={s.title}>Настройки</div>
      </div>
      <div style={s.body}>
        <div style={s.section}>
          <div style={s.sectionTitle}>ПРОФИЛЬ</div>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div onClick={() => setShowAvatarPicker(true)} style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}>
              {renderAvatar(user)}
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg)'
              }}>
                <ImageIcon size={14} />
              </div>
            </div>
          </div>
          <div style={s.profileInfo}>
            <div style={s.profileLabel}>Никнейм</div>
            <div style={s.profileValue}>{user?.nickname || '-'}</div>
            <div style={{ ...s.profileLabel, marginTop: '14px' }}>Юзернейм</div>
            <div style={s.profileValue}>@{user?.username || '-'}</div>
            {user?.current_badge && (
              <>
                <div style={{ ...s.profileLabel, marginTop: '14px' }}>Бейдж</div>
                <div style={{ fontSize: '24px', marginTop: '4px' }}>{user.current_badge}</div>
              </>
            )}
          </div>
        </div>
        <div style={{ ...s.section, animationDelay: '0.05s' }}>
          <div style={s.sectionTitle}>ТЕМА</div>
          {themes.map((t) => (
            <div key={t.id} style={s.themeOption} onClick={() => setTheme(t.id)}>
              <div style={s.themeName}>{t.name}</div>
              <div style={{ ...s.themeDot, background: t.color, ...(theme === t.id ? s.themeActive : {}) }} />
            </div>
          ))}
        </div>
        <div style={{ ...s.section, animationDelay: '0.1s' }}>
          <div style={s.sectionTitle}>ИГРЫ</div>
          <div style={{ ...s.themeOption, cursor: 'pointer' }} onClick={() => navigate('/messenger/battle')}>
          <div style={s.themeName}>
            <TrophyIcon size={18} /> Битва смайликов
          </div>
          <div style={{ fontSize: '18px' }}>›</div>
          </div>
        </div>
        <div style={{ ...s.section, animationDelay: '0.15s' }}>
          <div style={s.sectionTitle}>ПРО</div>
          <div style={{ ...s.themeOption, cursor: 'pointer', borderColor: proActive ? '#f59e0b' : 'var(--border)', background: proActive ? 'rgba(245,158,11,0.08)' : 'var(--bg-secondary)' }} onClick={() => navigate('/messenger/status/pro')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CrownIcon size={20} style={{ color: '#f59e0b' }} />
              <div>
                <div style={s.themeName}>Wintozo Pro</div>
                <div style={{ fontSize: '11px', color: proActive ? '#f59e0b' : 'var(--text-secondary)' }}>
                  {proLoading ? 'Загрузка...' : proActive ? 'Активен' : 'Неактивен'}
                </div>
              </div>
            </div>
            {proActive && <SparkleIcon size={18} style={{ color: '#f59e0b' }} />}
            <div style={{ fontSize: '18px' }}>›</div>
          </div>
          {proActive && (
            <div style={{ ...s.themeOption, cursor: 'pointer' }} onClick={() => navigate('/messenger/settings/pro-customize')}>
              <div style={s.themeName}>✨ Использовать возможности Wintozo-Pro</div>
              <div style={{ fontSize: '18px' }}>›</div>
            </div>
          )}
        </div>
        <div style={{ ...s.logout, animation: 'slideUp 0.4s ease 0.1s backwards' }} onClick={handleLogout}><LogoutIcon size={18} /> Выйти</div>
      </div>
      {showAvatarPicker && <AvatarPicker currentAvatar={user?.avatar ? { type: 'emoji', value: user.avatar } : user?.avatar_url ? { type: 'url', value: user.avatar_url } : null} onSelect={handleAvatarChange} onClose={() => setShowAvatarPicker(false)} />}
    </div>
  )
}