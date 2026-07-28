import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { BackIcon, CrownIcon, SparkleIcon, CheckIcon, SendIcon } from '../components/Icons.jsx'

const s = {
  container: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', color: 'var(--text)', animation: 'fadeIn 0.3s ease' },
  header: { padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', flexShrink: 0 },
  title: { fontWeight: 800, fontSize: '17px', flex: 1 },
  body: { flex: 1, overflowY: 'auto', padding: '20px 16px' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '14px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  card: { background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px', marginBottom: '12px' },
  option: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', borderStyle: 'solid', borderWidth: '2px', borderColor: 'var(--border)', cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s' },
  optionSelected: { borderColor: '#f59e0b', background: 'rgba(245,158,11,0.1)' },
  colorBtn: { width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
  colorBtnSelected: { outline: '3px solid #f59e0b', outlineOffset: '2px', transform: 'scale(1.1)' },
  fontBtn: { padding: '10px 16px', borderRadius: '10px', borderStyle: 'solid', borderWidth: '2px', borderColor: 'var(--border)', cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s', fontSize: '14px' },
  fontBtnSelected: { borderColor: '#f59e0b', background: 'rgba(245,158,11,0.1)' },
  saveBtn: { width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 800, fontSize: '16px', cursor: 'pointer', border: 'none', marginTop: '20px' },
  preview: { padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', marginTop: '12px', border: '1px solid var(--border)' }
}

const COLORS = [
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Фиолетовый', value: '#8b5cf6' },
  { name: 'Розовый', value: '#ec4899' },
  { name: 'Красный', value: '#ef4444' },
  { name: 'Оранжевый', value: '#f97316' },
  { name: 'Зелёный', value: '#22c55e' },
  { name: 'Бирюзовый', value: '#14b8a6' },
  { name: 'Золотой', value: '#f59e0b' }
]

const MULTIPLIERS = [
  { value: 0.5, label: 'x0.5', desc: 'Получаешь меньше очков' },
  { value: 1.0, label: 'x1.0', desc: 'Стандартный множитель' },
  { value: 1.5, label: 'x1.5', desc: 'Увеличенный множитель' },
  { value: 2.0, label: 'x2.0', desc: 'Двойные очки!' }
]

const FONTS = [
  { name: 'Обычный', value: 'system-ui, -apple-system, sans-serif' },
  { name: 'Моноширинный', value: 'monospace' },
  { name: 'Засечки', value: 'Georgia, serif' },
  { name: 'Жирный', value: 'Arial Black, sans-serif' }
]

export default function ProCustomizePage() {
  const navigate = useNavigate()
  const [username] = useState(() => localStorage.getItem('wintozo_username') || '')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Настройки Pro
  const [msgColor, setMsgColor] = useState('#3b82f6')
  const [msgFont, setMsgFont] = useState('system-ui, -apple-system, sans-serif')
  const [multiplier, setMultiplier] = useState(1.0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadProSettings()
  }, [])

  const loadProSettings = async () => {
    try {
      const { data } = await supabase
        .from('wintozo_users')
        .select('message_color, message_font, battle_multiplier')
        .eq('username', username)
        .single()
      
      if (data) {
        if (data.message_color) setMsgColor(data.message_color)
        if (data.message_font) setMsgFont(data.message_font)
        if (data.battle_multiplier) setMultiplier(data.battle_multiplier)
      }
    } catch (err) {
      console.error('Load Pro settings error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase
        .from('wintozo_users')
        .update({
          message_color: msgColor,
          message_font: msgFont,
          battle_multiplier: multiplier
        })
        .eq('username', username)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save Pro settings error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <button style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', background: 'var(--bg-tertiary)', display: 'flex' }} onClick={() => navigate(-1)}>
            <BackIcon size={20} />
          </button>
          <div style={s.title}>Pro-настройки</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', background: 'var(--bg-tertiary)', display: 'flex' }} onClick={() => navigate(-1)}>
          <BackIcon size={20} />
        </button>
        <div style={s.title}>✨ Pro-настройки</div>
      </div>

      <div style={s.body}>
        {/* Цвет сообщений */}
        <div style={s.section}>
          <div style={s.sectionTitle}>
            <SendIcon size={18} /> Цвет сообщений
          </div>
          <div style={s.card}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  style={{
                    ...s.colorBtn,
                    background: c.value,
                    ...(msgColor === c.value ? s.colorBtnSelected : {})
                  }}
                  onClick={() => setMsgColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
            <div style={s.preview}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Предпросмотр:</div>
              <div style={{ padding: '12px 16px', borderRadius: '18px', background: msgColor, color: '#fff', fontSize: '14px', display: 'inline-block', fontFamily: msgFont }}>
                Привет! Это моё сообщение с Pro
              </div>
            </div>
          </div>
        </div>

        {/* Шрифт сообщений */}
        <div style={s.section}>
          <div style={s.sectionTitle}>
            <SendIcon size={18} /> Шрифт сообщений
          </div>
          <div style={s.card}>
            {FONTS.map((f) => (
              <div
                key={f.value}
                style={{
                  ...s.option,
                  ...(msgFont === f.value ? s.optionSelected : {})
                }}
                onClick={() => setMsgFont(f.value)}
              >
                <div>
                  <div style={{ ...s.optionLabel, fontFamily: f.value }}>{f.name}</div>
                  <div style={{ ...s.optionDesc, fontFamily: f.value }}>Текст предпросмотра</div>
                </div>
                <div style={{ ...s.optionCheck, ...(msgFont === f.value ? s.optionCheckSelected : {}) }}>
                  {msgFont === f.value && <CheckIcon size={14} style={{ color: '#fff' }} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Множитель битвы */}
        <div style={s.section}>
          <div style={s.sectionTitle}>
            <SparkleIcon size={18} /> Множитель очков в битве
          </div>
          <div style={s.card}>
            {MULTIPLIERS.map((m) => (
              <div
                key={m.value}
                style={{
                  ...s.option,
                  ...(multiplier === m.value ? s.optionSelected : {})
                }}
                onClick={() => setMultiplier(m.value)}
              >
                <div>
                  <div style={{ ...s.optionLabel, fontSize: '18px', color: multiplier === m.value ? '#f59e0b' : 'inherit' }}>
                    {m.label}
                  </div>
                  <div style={s.optionDesc}>{m.desc}</div>
                </div>
                <div style={{ ...s.optionCheck, ...(multiplier === m.value ? s.optionCheckSelected : {}) }}>
                  {multiplier === m.value && <CheckIcon size={14} style={{ color: '#fff' }} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка сохранить */}
        <button
          style={{
            ...s.saveBtn,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? 'wait' : 'pointer'
          }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Сохранение...' : saved ? '✅ Сохранено!' : '💾 Сохранить настройки'}
        </button>
      </div>
    </div>
  )
}
