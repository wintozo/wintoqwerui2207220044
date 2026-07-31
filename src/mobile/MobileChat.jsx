import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useChat } from '../hooks/useChat.js'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder.js'
import { MediaMessage } from '../components/MediaMessage.jsx'
import { SearchIcon, SettingsIcon, LogoutIcon, CloseIcon, BackIcon, SendIcon, SunIcon, MoonIcon, SparkIcon, MicIcon, PaperclipIcon } from '../components/Icons.jsx'
import { supabase } from '../lib/supabase.js'

const s = {
  layout: { display: 'flex', height: '100dvh', background: 'var(--bg)', color: 'var(--text)', animation: 'fadeIn 0.5s ease', flexDirection: 'column' },
  chatList: { flex: 1, overflowY: 'auto' },
  chatItem: { display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px', cursor: 'pointer', transition: 'background var(--transition)', animation: 'slideUp 0.4s ease backwards' },
  chatItemActive: { background: 'var(--accent-soft)' },
  avatar: { width: '46px', height: '46px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', flexShrink: 0, boxShadow: 'var(--shadow-accent)' },
  chatInfo: { flex: 1, minWidth: 0 },
  chatName: { fontWeight: 600, fontSize: '15px' },
  chatLastMsg: { fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  emptySidebar: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '14px', padding: '24px', textAlign: 'center' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
  noChat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  noChatTitle: { fontSize: '20px', fontWeight: 700, color: 'var(--text-secondary)' },
  noChatSub: { fontSize: '14px', color: 'var(--text-secondary)' },
  chatHeader: { padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', flexShrink: 0 },
  chatTitle: { fontWeight: 700, fontSize: '16px', flex: 1 },
  chatUsername: { fontSize: '13px', color: 'var(--text-secondary)' },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  msgRow: { display: 'flex' },
  msgSelf: { justifyContent: 'flex-end' },
  msgOther: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '75%', padding: '10px 16px', borderRadius: '18px', fontSize: '14px', lineHeight: 1.4, wordBreak: 'break-word', animation: 'msgIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards' },
  msgSelfBubble: { background: 'var(--accent)', color: 'var(--accent-text)', borderBottomRightRadius: '4px', boxShadow: 'var(--shadow-accent)' },
  msgOtherBubble: { background: 'var(--bg-tertiary)', color: 'var(--text)', borderBottomLeftRadius: '4px' },
  inputBar: { display: 'flex', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', gap: '10px', flexShrink: 0, alignItems: 'center' },
  input: { flex: 1, minWidth: 0, padding: '12px 18px', background: 'var(--bg-tertiary)', borderRadius: '24px', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', transition: 'border-color var(--transition)' },
  sendBtn: { padding: '12px 20px', borderRadius: '24px', background: 'var(--accent)', color: 'var(--accent-text)', fontWeight: 700, cursor: 'pointer', border: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform var(--transition), opacity var(--transition)', boxShadow: 'var(--shadow-accent)', flexShrink: 0 },
  topBar: { padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 },
  iconBtn: { padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition)' },
  micBtn: { width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition)', flexShrink: 0, background: 'var(--bg-tertiary)', color: 'var(--text)', border: '1px solid var(--border)', userSelect: 'none' },
  micBtnActive: { background: '#ef4444', color: '#fff', border: 'none', transform: 'scale(1.1)', boxShadow: '0 0 0 4px rgba(239,68,68,0.2)' },
  recOverlay: { position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '24px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-lg)', zIndex: 100 },
  recDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' },
  recTimer: { fontSize: '15px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
  recWave: { display: 'flex', alignItems: 'center', gap: '2px', height: '20px' },
  recWaveBar: { width: '3px', background: '#ef4444', borderRadius: '2px', transition: 'height 0.05s ease' },
  recHint: { fontSize: '12px', color: 'var(--text-secondary)' },
  uploadBar: { position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '24px', padding: '10px 20px', fontSize: '14px', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-lg)', zIndex: 100, animation: 'slideUp 0.3s ease' },
  avatarImg: { width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px' },
  loadingDots: { display: 'flex', gap: '6px', alignItems: 'center' },
  loadingDot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', animation: 'loadingDots 1.4s ease-in-out infinite' }
}

export default function MobileChat() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const { chats, activeChat, activeChatUser, messages, loading, openChat, closeChat, sendMessage, sendMediaMessage, sendImageMessage } = useChat()
  const [text, setText] = useState('')
  const [sendingImage, setSendingImage] = useState(false)
  const fileInputRef = useRef(null)
  const msgEndRef = useRef(null)
  const [theme, setTheme] = useState(localStorage.getItem('wintozo_theme') || 'light')
  
  // Pro-настройки сообщений
  const [proSettings, setProSettings] = useState({ message_color: '', message_font: '', battle_multiplier: 1.0 })

  useEffect(() => {
    loadProSettings()
  }, [])

  const loadProSettings = async () => {
    try {
      const { data } = await supabase
        .from('wintozo_users')
        .select('message_color, message_font, battle_multiplier')
        .eq('username', user?.username)
        .single()
      if (data) {
        setProSettings({
          message_color: data.message_color || '',
          message_font: data.message_font || '',
          battle_multiplier: data.battle_multiplier || 1.0
        })
      }
    } catch (err) {
      console.error('Load Pro settings error:', err)
    }
  }

  const voice = useVoiceRecorder(async (data) => {
    await sendMediaMessage(data)
  }, activeChat, user)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('wintozo_theme', theme)
  }, [theme])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!text.trim()) return
    sendMessage(text)
    setText('')
  }

  const handleImageSend = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeChat) return
    setSendingImage(true)
    await sendImageMessage(file)
    setSendingImage(false)
    e.target.value = ''
  }

  // Press-and-hold: зажал → запись, отпустил → отправка
  const handleMicDown = (e) => {
    e.preventDefault()
    if (!activeChat) return
    voice.startRecording()
  }
  const handleMicUp = (e) => {
    e.preventDefault()
    voice.stopRecording()
  }

  function handleLogout() {
    signOut()
    localStorage.removeItem('wintozo_device')
    navigate('/messenger/registration/username')
  }

  function cycleTheme() {
    const order = ['light', 'dark', 'midnight', 'sunset']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  const fmtTime = (t) => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`

  const renderAvatar = (u, size = '46px') => {
    if (u?.avatar_url) {
      return <img src={u.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    }
    if (u?.avatar) {
      return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size === '46px' ? '18px' : '36px', flexShrink: 0 }}>{u.avatar}</div>
    }
    return <div style={s.avatar}>{(u?.nickname || '?')[0]?.toUpperCase()}</div>
  }

  const renderBadge = (u, size = '16px') => {
    if (u?.current_badge) {
      return <span style={{ fontSize: size, marginLeft: '4px' }}>{u.current_badge}</span>
    }
    return null
  }

  return (
    <div style={s.layout}>
      {!activeChat ? (
        <>
          {/* Sidebar — список чатов */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', gap: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-1px', flex: 1 }}>Wintozo</div>
            <div style={s.iconBtn} onClick={() => navigate('/messenger/phone/chat/search')}><SearchIcon size={18} /></div>
            <div style={s.iconBtn} onClick={() => navigate('/messenger/phone/settings')}><SettingsIcon size={18} /></div>
            <div style={s.iconBtn} onClick={handleLogout}><LogoutIcon size={18} /></div>
          </div>
          <div style={s.chatList}>
            {loading ? (
              <div style={s.emptySidebar}>
                <div style={s.loadingContainer}>
                  <div style={s.loadingDots}>
                    <div style={s.loadingDot} />
                    <div style={s.loadingDot} />
                    <div style={s.loadingDot} />
                  </div>
                </div>
              </div>
            ) : chats.length === 0 ? (
              <div style={s.emptySidebar}>Нет чатов. Найди пользователя через поиск</div>
            ) : (
              chats.map((chat, i) => (
                <div key={chat.chatId} style={{ ...s.chatItem, animationDelay: `${i * 0.05}s`, ...(activeChat === chat.chatId ? s.chatItemActive : {}) }} onClick={() => openChat(chat.chatId, chat.partner)}>
                  {renderAvatar(chat.partner)}
                  <div style={s.chatInfo}>
                    <div style={s.chatName}>{chat.partner?.nickname || 'Неизвестно'}</div>
                    <div style={s.chatLastMsg}>{chat.lastMessage || 'Нет сообщений'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Chat Area */}
          <div style={s.chatArea}>
            <div style={s.topBar}>
              <div style={s.iconBtn} onClick={cycleTheme}>
                {theme === 'light' ? <MoonIcon size={18} /> : theme === 'dark' ? <SparkIcon size={18} /> : theme === 'midnight' ? <SunIcon size={18} /> : <SparkIcon size={18} />}
              </div>
            </div>
            <div style={s.chatHeader}>
              <div style={s.iconBtn} onClick={closeChat}><BackIcon size={18} /></div>
              {renderAvatar(activeChatUser)}
              <div>
                <div style={s.chatTitle}>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/messenger/phone/chat/user/${activeChatUser?.username}`)}>
                    {activeChatUser?.nickname || 'Чат'}
                  </span>
                  {renderBadge(activeChatUser)}
                </div>
                <div style={s.chatUsername}>@{activeChatUser?.username || ''}</div>
              </div>
            </div>
        <div style={s.messagesContainer}>
          {messages.map((msg, i) => {
            const isSelf = msg.sender_username === user?.username
            const isImage = msg.content?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            const isAudio = msg.content?.startsWith('http') && !isImage
            if (isImage) {
              return (
                <div key={msg.id} style={{ ...s.msgRow, ...(isSelf ? s.msgSelf : s.msgOther) }}>
                  <img src={msg.content} alt="photo" style={{ maxWidth: '220px', borderRadius: '18px', cursor: 'pointer', boxShadow: 'var(--shadow-accent)', animation: 'msgIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards', animationDelay: `${i * 0.03}s` }} onClick={() => window.open(msg.content, '_blank')} />
                </div>
              )
            }
            if (isAudio) {
              return (
                <div key={msg.id} style={{ ...s.msgRow, ...(isSelf ? s.msgSelf : s.msgOther) }}>
                  <MediaMessage message={msg} isSelf={isSelf} />
                </div>
              )
            }
            return (
                <div key={msg.id} style={{ ...s.msgRow, ...(isSelf ? s.msgSelf : s.msgOther) }}>
<div 
                    style={{ 
                      ...s.msgBubble, 
                      ...(isSelf ? s.msgSelfBubble : s.msgOtherBubble),
                      ...(msg.message_color ? { background: msg.message_color } : {}),
                      ...(msg.message_font ? { fontFamily: msg.message_font } : {}),
                      animationDelay: `${i * 0.03}s`
                    }}
                  >
                  {msg.content}
                </div>
              </div>
            )
          })}
          <div ref={msgEndRef} />
        </div>
            <div style={s.inputBar}>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSend} />
              <button
                style={{ ...s.iconBtn, width: '42px', height: '42px', padding: '0' }}
                onClick={() => fileInputRef.current?.click()}
                title="Прикрепить фото"
              >
                <PaperclipIcon size={20} />
              </button>
              <button
                style={{ ...s.micBtn, ...(voice.isRecording ? s.micBtnActive : {}) }}
                onTouchStart={handleMicDown}
                onTouchEnd={handleMicUp}
                onMouseDown={handleMicDown}
                onMouseUp={handleMicUp}
                onMouseLeave={voice.isRecording ? voice.cancelRecording : undefined}
                title="Зажми и говори"
              >
                <MicIcon size={20} />
              </button>
              <input style={s.input} placeholder="Сообщение..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
              <button style={{ ...s.sendBtn, transform: sendingImage ? 'scale(0.95)' : 'scale(1)' }} onClick={handleSend} aria-label="Отправить"><SendIcon size={16} /></button>
            </div>
          </div>

          {voice.isRecording && (
            <div style={s.recOverlay}>
              <div style={s.recDot} />
              <div style={s.recTimer}>{fmtTime(voice.recordingTime)}</div>
              <div style={s.recWave}>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...s.recWaveBar,
                      height: `${Math.max(4, voice.audioLevel * 20 * (0.5 + Math.random() * 0.5))}px`
                    }}
                  />
                ))}
              </div>
              <div style={s.recHint}>Отпусти для отправки</div>
            </div>
          )}

          {(voice.uploading || sendingImage) && (
            <div style={s.uploadBar}>{sendingImage ? 'Отправка фото...' : 'Отправка голосового...'}</div>
          )}
        </>
      )}
    </div>
  )
}
