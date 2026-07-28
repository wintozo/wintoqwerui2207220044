import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { BackIcon, CrownIcon, SparkleIcon, CheckIcon, GiftIcon, ShieldIcon, StarIcon, ZapIcon, DiamondIcon } from '../components/Icons.jsx'

const s = {
  container: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', color: 'var(--text)', animation: 'fadeIn 0.3s ease' },
  header: { padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', flexShrink: 0 },
  title: { fontWeight: 800, fontSize: '17px', flex: 1 },
  body: { flex: 1, overflowY: 'auto', padding: '20px 16px' },
  statusCard: { borderRadius: '20px', padding: '24px', marginBottom: '20px', textAlign: 'center' },
  statusCardActive: { background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #f59e0b' },
  statusCardInactive: { background: 'var(--bg-secondary)', border: '1px solid var(--border)' },
  crown: { fontSize: '56px', marginBottom: '12px' },
  statusTitle: { fontSize: '22px', fontWeight: 800, marginBottom: '8px' },
  statusDesc: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' },
  endDate: { fontSize: '13px', fontWeight: 600, color: '#92400e', padding: '8px 16px', background: 'rgba(245,158,11,0.15)', borderRadius: '12px', display: 'inline-block' },
  features: { display: 'flex', flexDirection: 'column', gap: '12px' },
  feature: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border)' },
  featureIcon: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureTitle: { fontWeight: 700, fontSize: '14px' },
  featureDesc: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' },
  ctaBtn: { width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 800, fontSize: '16px', cursor: 'pointer', border: 'none', marginTop: '12px' },
  ctaBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  infoText: { fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }
}

export default function ProStatusPage() {
  const navigate = useNavigate()
  const [username] = useState(() => localStorage.getItem('wintozo_username') || '')
  const [proStatus, setProStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDark] = useState(() => document.documentElement.getAttribute('data-theme') !== 'light')

  useEffect(() => {
    if (!username) return
    loadProStatus()
  }, [username])

  const loadProStatus = async () => {
    try {
      const { data } = await supabase.rpc('get_pro_status', { p_username: username })
      setProStatus(data)
    } catch (err) {
      console.error('Pro status error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUsePro = () => {
    if (!proStatus?.active) return
    navigate('/messenger/settings/pro-customize')
  }

  const formatEndDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = d - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days <= 0) return 'Истек'
    return `Осталось ${days} дн. (${d.toLocaleDateString('ru-RU')})`
  }

  const features = [
    { icon: <CrownIcon size={20} />, title: 'VIP-статус', desc: 'Золотая рамка профиля и значок Pro', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { icon: <DiamondIcon size={20} />, title: 'Кастомные темы', desc: 'Выбирай любые цвета для сообщений', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    { icon: <ShieldIcon size={20} />, title: 'Скрытые функции', desc: 'Доступ к эксклюзивным возможностям', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    { icon: <ZapIcon size={20} />, title: 'Очки ×2 в битве', desc: 'Двойные очки за каждое сообщение', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    { icon: <StarIcon size={20} />, title: 'Приоритетная поддержка', desc: 'Быстрый ответ от админа', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' }
  ]

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <button style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', background: 'var(--bg-tertiary)', display: 'flex' }} onClick={() => navigate(-1)}>
            <BackIcon size={20} />
          </button>
          <div style={s.title}>Wintozo Pro</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    )
  }

  const isActive = proStatus?.active

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', background: 'var(--bg-tertiary)', display: 'flex' }} onClick={() => navigate(-1)}>
          <BackIcon size={20} />
        </button>
        <div style={s.title}>Wintozo Pro</div>
        {isActive && (
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: '20px' }}>
            ACTIVE
          </span>
        )}
      </div>

      <div style={s.body}>
        {/* Статус */}
        <div style={{ ...s.statusCard, ...(isActive ? s.statusCardActive : s.statusCardInactive) }}>
          <div style={s.crown}>
            {isActive ? (isDark ? '👑' : '👑') : '👑'}
          </div>
          <div style={s.statusTitle}>
            {isActive ? 'Wintozo Pro активен' : 'Wintozo Pro'}
          </div>
          <div style={s.statusDesc}>
            {isActive
              ? 'У вас есть все премиум-функции! Наслаждайтесь.'
              : 'Получите доступ к VIP-функциям и эксклюзивным возможностям'}
          </div>
          {isActive && proStatus?.end_date && (
            <div style={s.endDate}>{formatEndDate(proStatus.end_date)}</div>
          )}
          {isActive && (
            <button style={s.ctaBtn} onClick={handleUsePro}>
              ✨ Настроить Pro-функции
            </button>
          )}
        </div>

        {/* Функции Pro */}
        <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>Что даёт Pro:</h2>
        <div style={s.features}>
          {features.map((f, i) => (
            <div key={i} style={s.feature}>
              <div style={{ ...s.featureIcon, color: f.color, background: f.bg }}>
                {f.icon}
              </div>
              <div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Как получить */}
        <h2 style={{ fontSize: '16px', fontWeight: 800, marginTop: '24px', marginBottom: '12px' }}>Как получить Pro:</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px', lineHeight: 1.5 }}>
            <strong>🏆 Победа в битве смайликов</strong> — все участники команды-победителя получают Pro на 3 дня
          </div>
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px', lineHeight: 1.5 }}>
            <strong>📅 Ежедневная серия</strong> — заходи каждый день: 15 дней подряд = Pro на 10 дней
          </div>
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px', lineHeight: 1.5 }}>
            <strong>🎁 Рандомная выдача</strong> — админ может случайно выбрать пользователя и выдать Pro
          </div>
        </div>

        <div style={s.infoText}>
          Pro действует на всех устройствах. После истечения — статус снимается автоматически.
        </div>
      </div>
    </div>
  )
}
