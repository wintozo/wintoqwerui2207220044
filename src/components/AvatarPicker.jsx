import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { CloseIcon } from './Icons.jsx'

const PRESET_COLORS = [
  '#3b82f6', // синий
  '#8b5cf6', // фиолетовый
  '#ec4899', // розовый
  '#ef4444', // красный
  '#f97316', // оранжевый
  '#eab308', // жёлтый
  '#22c55e', // зелёный
  '#06b6d4', // голубой
  '#6366f1', // индиго
  '#14b8a6', // бирюзовый
  '#f43f5e', // малиновый
  '#a855f7', // пурпурный
]

const PRESET_EMOJIS = ['😀', '😎', '🤖', '👾', '🎮', '🚀', '🔥', '⚡', '🌟', '💎', '🎯', '🎨']

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease'
  },
  panel: {
    background: 'var(--bg)',
    borderRadius: '20px',
    padding: '24px',
    maxWidth: '360px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    animation: 'slideUp 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '18px',
    fontWeight: 700
  },
  sectionTitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    marginBottom: '10px',
    marginTop: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  avatarOption: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s ease',
    background: 'var(--bg-secondary)',
    color: 'var(--text)'
  },
  avatarOptionSelected: {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 0 3px var(--accent-glow)'
  },
  uploadBtn: {
    width: '100%',
    padding: '14px',
    background: 'var(--bg-secondary)',
    border: '2px dashed var(--border)',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  currentAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 700,
    color: 'white',
    background: 'var(--accent)',
    position: 'relative',
    overflow: 'hidden'
  },
  currentAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%'
  }
}

export default function AvatarPicker({ currentAvatar, onSelect, onClose }) {
  const [selected, setSelected] = useState(currentAvatar)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

  const handleSelect = (avatar) => {
    setSelected(avatar)
    setPreviewUrl(null)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Валидация формата
    const ext = file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_TYPES.includes(file.type) && !['svg', 'png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      alert('Поддерживаемые форматы: SVG, PNG, JPG, JPEG, WEBP')
      e.target.value = ''
      return
    }

    // Валидация размера
    if (file.size > MAX_SIZE) {
      alert('Размер файла не должен превышать 5 МБ')
      e.target.value = ''
      return
    }

    // Показываем превью
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreviewUrl(ev.target.result)
      setSelected({ type: 'url', value: ev.target.result })
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const username = localStorage.getItem('wintozo_username')
      const ext = file.name.split('.').pop().toLowerCase() || 'png'
      const fileName = `${username}_${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setSelected({ type: 'url', value: publicUrl })
      setPreviewUrl(null) // убираем локальное превью, показываем URL
    } catch (err) {
      console.error('Ошибка загрузки аватарки:', err)
      alert('Не удалось загрузить аватарку: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!selected) return

    try {
      const username = localStorage.getItem('wintozo_username')
      const updates = {}
      if (selected.type === 'emoji') {
        updates.avatar = selected.value
        updates.avatar_url = ''
      } else if (selected.type === 'color') {
        updates.avatar = ''
        updates.avatar_url = selected.value
      } else if (selected.type === 'url') {
        updates.avatar = ''
        updates.avatar_url = selected.value
      }

      const { error } = await supabase
        .from('wintozo_users')
        .update(updates)
        .eq('username', username)

      if (error) throw error

      onSelect(selected)
      onClose()
    } catch (err) {
      console.error('Ошибка сохранения аватарки:', err)
      alert('Не удалось сохранить аватарку')
    }
  }

  const handleRemove = async () => {
    try {
      const username = localStorage.getItem('wintozo_username')
      const { error } = await supabase
        .from('wintozo_users')
        .update({ avatar: '', avatar_url: '' })
        .eq('username', username)

      if (error) throw error

      setSelected(null)
      setPreviewUrl(null)
      onSelect(null)
      onClose()
    } catch (err) {
      console.error('Ошибка удаления аватарки:', err)
      alert('Не удалось удалить аватарку')
    }
  }

  const renderAvatarPreview = () => {
    if (!selected) return null
    if (selected.type === 'emoji') return selected.value
    if (selected.type === 'color') return selected.value[0]?.toUpperCase() || '?'
    // Если это локальное превью (base64) или URL — показываем картинку
    if (selected.type === 'url') return (
      <img src={selected.value} alt="" style={s.currentAvatarImg} />
    )
    return null
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div style={s.title}>Аватарка</div>
          <div style={{ cursor: 'pointer', padding: '4px' }} onClick={onClose}>
            <CloseIcon size={20} />
          </div>
        </div>

        <div style={s.currentAvatar}>
          {renderAvatarPreview() || '?'}
        </div>

        <div style={s.sectionTitle}>ЭМОДЗИ</div>
        <div style={s.grid}>
          {PRESET_EMOJIS.map((emoji) => (
            <div
              key={emoji}
              style={{
                ...s.avatarOption,
                ...(selected?.type === 'emoji' && selected?.value === emoji ? s.avatarOptionSelected : {})
              }}
              onClick={() => handleSelect({ type: 'emoji', value: emoji })}
            >
              {emoji}
            </div>
          ))}
        </div>

        <div style={s.sectionTitle}>ЦВЕТА</div>
        <div style={s.grid}>
          {PRESET_COLORS.map((color) => (
            <div
              key={color}
              style={{
                ...s.avatarOption,
                background: color,
                color: 'white',
                fontWeight: 700,
                fontSize: '20px',
                ...(selected?.type === 'color' && selected?.value === color ? s.avatarOptionSelected : {})
              }}
              onClick={() => handleSelect({ type: 'color', value: color })}
            >
              {color[0]?.toUpperCase() || '?'}
            </div>
          ))}
        </div>

        <div style={s.sectionTitle}>ЗАГРУЗИТЬ ФОТО</div>
        <button
          style={s.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Загрузка...' : '📷 Выбрать фото'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />

        <button
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '14px',
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: selected ? 'pointer' : 'not-allowed',
            opacity: selected ? 1 : 0.5
          }}
          onClick={handleSave}
          disabled={!selected}
        >
          Сохранить
        </button>

        {currentAvatar && (
          <button
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '12px',
              background: 'transparent',
              color: 'var(--error)',
              border: '1.5px solid var(--error)',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
            onClick={handleRemove}
          >
            Удалить аватарку
          </button>
        )}
      </div>
    </div>
  )
}
