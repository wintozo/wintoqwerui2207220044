import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { BackIcon, TrophyIcon, UsersIcon, ZapIcon, CrownIcon } from '../components/Icons.jsx'

const ALL_EMOJIS = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '😎', '💎', '👑', '⚡', '🌟', '😍', '🤔', '😰', '🙏', '💪', '✅', '❌', '🚀', '💜', '🐶', '🐱', '🦊', '🐸', '🐹', '🐯', '🦄', '🐲', '🎮', '🎸', '🍕', '🍔', '🌮', '🍩', '🍪', '☕', '🌈', '⚽', '🏆', '💡']

const s = {
  container: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', color: 'var(--text)', animation: 'fadeIn 0.3s ease' },
  header: { padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white', flexShrink: 0 },
  headerTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  title: { fontWeight: 800, fontSize: '17px', flex: 1 },
  back: { padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tabs: { display: 'flex', gap: '8px' },
  tab: { padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)' },
  tabActive: { background: 'rgba(255,255,255,0.25)', color: 'white' },
  body: { flex: 1, overflowY: 'auto', padding: '16px' },
  card: { background: 'var(--bg-secondary)', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1px solid var(--border)' },
  cardActive: { background: 'linear-gradient(135deg, #ffedd5, #fef3c7)', borderColor: '#f59e0b' },
  cardActiveDark: { background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,179,8,0.15))', borderColor: '#f59e0b' },
  emoji: { fontSize: '32px' },
  rank: { fontSize: '14px', fontWeight: 700 },
  points: { fontSize: '20px', fontWeight: 800, color: '#f97316' },
  subPoints: { fontSize: '11px', color: 'var(--text-secondary)' },
  joinBtn: { width: '100%', padding: '10px', borderRadius: '12px', background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '16px' },
  emojiBtn: { aspectRatio: '1', borderRadius: '16px', background: 'var(--bg-secondary)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', cursor: 'pointer' },
  teamInfo: { textAlign: 'center', marginBottom: '20px' },
  teamEmoji: { fontSize: '64px' },
  teamName: { fontSize: '18px', fontWeight: 800, marginTop: '8px' },
  proBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', padding: '4px 12px', background: '#fef3c7', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#92400e' },
  proBadgeDark: { background: 'rgba(234,179,8,0.15)', color: '#fbbf24' },
  historyItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border)' },
  loading: { display: 'flex', justifyContent: 'center', padding: '40px' },
  empty: { textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' },
  leaveBtn: { width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent', border: '2px solid #ef4444', color: '#ef4444', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginTop: '16px' }
}

export default function BattlePage() {
  const navigate = useNavigate()
  const [username] = useState(() => localStorage.getItem('wintozo_username') || '')
  const [myTeam, setMyTeam] = useState(null)
  const [standings, setStandings] = useState([])
  const [teamTop, setTeamTop] = useState([])
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('standings')
  const [proActive, setProActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [streak, setStreak] = useState(0)
  const [isDark] = useState(() => document.documentElement.getAttribute('data-theme') !== 'light')

  useEffect(() => {
    if (!username) return
    init(username)
  }, [username])

  const init = async (user) => {
    setLoading(true)
    try {
      // Подвести итоги недели
      try {
        await supabase.rpc('settle_battle_week')
      } catch {}

      const [stand, hist, pro] = await Promise.all([
        supabase.rpc('get_battle_standings'),
        supabase.from('wintozo_battle_history').select('*').order('week_start', { ascending: false }).limit(10),
        supabase.rpc('get_pro_status', { p_username: user })
      ])

      setStandings(stand.data || [])
      setHistory(hist.data || [])
      setProActive(pro.data?.active || false)

      // Получаем команду пользователя (если есть)
      try {
        const { data: myData } = await supabase
          .from('wintozo_battle_users')
          .select('team_emoji')
          .eq('username', user)
          .limit(1)
        
        if (myData && myData.length > 0) {
          setMyTeam(myData[0].team_emoji)
          const top = await supabase.rpc('get_team_top', { p_emoji: myData[0].team_emoji })
          setTeamTop(top.data || [])
        }
      } catch {}
    } catch (err) {
      console.error('Battle init error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (emoji) => {
    if (!username) return
    setJoining(true)
    try {
      const res = await supabase.rpc('join_battle_team', {
        p_username: username,
        p_emoji: emoji
      })
      if (res.data?.success) {
        setMyTeam(emoji)
        const top = await supabase.rpc('get_team_top', { p_emoji: emoji })
        setTeamTop(top.data || [])
        const stand = await supabase.rpc('get_battle_standings')
        setStandings(stand.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setJoining(false)
    }
  }

  const handleClaimDaily = async () => {
    try {
      const res = await supabase.rpc('claim_daily_login', { p_username: username })
      if (res.data?.claimed) {
        setClaimed(true)
        setStreak(res.data.streak || 0)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const myStanding = standings.find((s) => s.emoji === myTeam)

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <button style={s.back} onClick={() => navigate(-1)}>
            <BackIcon size={20} />
          </button>
          <div style={s.title}>🏆 Битва смайликов</div>
        </div>
        <div style={s.tabs}>
          {[
            { key: 'standings', label: 'Рейтинг' },
            { key: 'my', label: 'Моя команда' },
            { key: 'history', label: 'История' }
          ].map((t) => (
            <button
              key={t.key}
              style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.body}>
        {loading ? (
          <div style={s.loading}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTop: '3px solid #f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Рейтинг */}
            {tab === 'standings' && (
              <>
                <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrophyIcon size={18} /> Рейтинг команд
                </h2>

                {/* Описание наград */}
                <div style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  marginBottom: '16px',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px', color: '#92400e' }}>🏆 Награды для победителей:</div>
                  <div style={{ fontSize: '12px', color: '#78350f', lineHeight: 1.6 }}>
                    <div>👑 <strong>Wintozo Pro на 3 дня</strong> — VIP-статус, кастомные темы, скрытые функции</div>
                    <div>⭐ <strong>Эксклюзивный значок</strong> в ваш профиль</div>
                  </div>
                </div>

                {standings.length === 0 ? (
                  <div style={s.empty}>Никто ещё не участвует! Выберите команду 👇</div>
                ) : (
                  standings.map((item, i) => (
                    <div key={item.emoji} style={{
                      ...s.card,
                      ...(myTeam === item.emoji ? (isDark ? s.cardActiveDark : s.cardActive) : {})
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={s.emoji}>{item.emoji}</span>
                          <div>
                            <div style={s.rank}>
                              #{i + 1}
                              {myTeam === item.emoji && <span style={{ color: '#f97316', fontSize: '11px', marginLeft: '8px' }}>— вы</span>}
                            </div>
                            <div style={s.subPoints}>{item.member_count} участников</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={s.points}>{item.total_points}</div>
                          <div style={s.subPoints}>очков</div>
                        </div>
                      </div>
                      {myTeam !== item.emoji && (
                        <button style={{ ...s.joinBtn, marginTop: '10px' }} onClick={() => handleJoin(item.emoji)} disabled={joining}>
                          {joining ? '...' : `Вступить ${item.emoji}`}
                        </button>
                      )}
                    </div>
                  ))
                )}

                {/* Выбор команды — всегда показываем если нет команды */}
                {!myTeam && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)' }}>Выберите свой смайлик:</div>
                    <div style={s.emojiGrid}>
                      {ALL_EMOJIS.filter((e) => !standings.some((s) => s.emoji === e)).map((emoji) => (
                        <button
                          key={emoji}
                          style={s.emojiBtn}
                          onClick={() => handleJoin(emoji)}
                          disabled={joining}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Моя команда */}
            {tab === 'my' && (
              <>
                {myTeam ? (
                  <>
                    <div style={s.teamInfo}>
                      <div style={s.teamEmoji}>{myTeam}</div>
                      <div style={s.teamName}>Команда {myTeam}</div>
                      {myStanding && (
                        <div style={s.subPoints}>
                          {myStanding.total_points} очков · {myStanding.member_count} участников
                        </div>
                      )}
                      {proActive && (
                        <div style={{ ...s.proBadge, ...(isDark ? s.proBadgeDark : {}) }}>
                          <CrownIcon size={12} /> Pro ×2
                        </div>
                      )}
                    </div>

                    {/* Бейджи */}
                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⭐ Ваши бейджи
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <div style={{
                        padding: '8px 14px',
                        borderRadius: '12px',
                        background: isDark ? 'rgba(251,191,36,0.15)' : '#fef3c7',
                        border: '1px solid #f59e0b',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        🏆 Активная битва
                      </div>
                    </div>

                    {/* Ежедневный вход */}
                    <button
                      onClick={handleClaimDaily}
                      disabled={claimed}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        background: claimed ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: claimed ? 'default' : 'pointer',
                        border: 'none',
                        marginBottom: '16px'
                      }}
                    >
                      {claimed ? `✅ Получено! Серия: ${streak} дн.` : '🎁 Ежедневный бонус (+10 очков)'}
                    </button>

                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UsersIcon size={14} /> Топ участников
                    </div>
                    {teamTop.length === 0 ? (
                      <div style={{ ...s.empty, padding: '20px' }}>Пока нет очков. Пишите сообщения!</div>
                    ) : (
                      teamTop.map((u, i) => (
                        <div key={u.username} style={{ ...s.card, marginBottom: '8px', padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-secondary)', width: '20px', textAlign: 'center' }}>#{i + 1}</span>
                              <span style={{ fontWeight: 600, fontSize: '14px' }}>
                                {u.username}
                                {u.multiplier > 1 && ' 👑'}
                              </span>
                            </div>
                            <span style={{ fontWeight: 800, color: '#f97316' }}>{u.total_score}</span>
                          </div>
                        </div>
                      ))
                    )}

                    <button style={s.leaveBtn} onClick={() => handleJoin(myTeam)}>
                      Сменить команду (очки сбросятся)
                    </button>
                  </>
                ) : (
                  <div style={{ ...s.empty, padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>⚡</div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>Вы не в команде</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>Перейдите на вкладку «Рейтинг» чтобы выбрать</div>
                  </div>
                )}
              </>
            )}

            {/* История */}
            {tab === 'history' && (
              <>
                <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrophyIcon size={18} /> Прошедшие битвы
                </h2>
                {history.length === 0 ? (
                  <div style={s.empty}>История пуста</div>
                ) : (
                  history.map((h) => (
                    <div key={h.id} style={s.historyItem}>
                      <span style={{ fontSize: '28px' }}>{h.winning_emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>Победитель: {h.winning_emoji}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {new Date(h.week_start).toLocaleDateString('ru-RU')} — {new Date(h.week_end).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
