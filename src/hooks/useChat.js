import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

export function useChat() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [activeChatUser, setActiveChatUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const loadChats = useCallback(async () => {
    if (!user) {
      setChats([])
      setLoading(false)
      return
    }
    try {
      const { data: participants } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('username', user.username)

      if (!participants || participants.length === 0) {
        setChats([])
        setLoading(false)
        return
      }

      const chatIds = participants.map((p) => p.chat_id)

      const { data: allParticipants } = await supabase
        .from('chat_participants')
        .select('chat_id, username')
        .in('chat_id', chatIds)

      const userNames = [...new Set((allParticipants || []).map((p) => p.username).filter((n) => n !== user.username))]

      let userMap = {}
      if (userNames.length > 0) {
        const { data: users } = await supabase
          .from('wintozo_users')
          .select('username, nickname')
          .in('username', userNames)
        users?.forEach((u) => { userMap[u.username] = u })
      }

      const { data: lastMessages } = await supabase
        .from('messages')
        .select('chat_id, content, created_at')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: false })

      const chatMap = {}
      for (const p of allParticipants || []) {
        if (p.username !== user.username) {
          const partner = userMap[p.username] || { username: p.username, nickname: p.username }
          const lastMsg = (lastMessages || []).find((m) => m.chat_id === p.chat_id)
          // Форматируем последнее сообщение: URL → иконка
          const raw = lastMsg?.content || ''
          let display = raw
          if (raw.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            display = '📷 Фото'
          } else if (raw.startsWith('http')) {
            display = '🎤 Голосовое'
          }
          chatMap[p.chat_id] = {
            chatId: p.chat_id,
            partner,
            lastMessage: display,
            lastTime: lastMsg ? lastMsg.created_at : null
          }
        }
      }
      setChats(Object.values(chatMap).sort((a, b) => {
        if (!a.lastTime) return 1
        if (!b.lastTime) return -1
        return new Date(b.lastTime) - new Date(a.lastTime)
      }))
      setLoading(false)
    } catch (err) {
      console.error('loadChats error:', err)
      setChats([])
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  const activeChatRef = useRef(null)
  const chatChannelRef = useRef(null)
  const listChannelRef = useRef(null)

  const openChat = useCallback(async (chatId, partner) => {
    // Правильно удаляем предыдущий канал по ссылке
    if (chatChannelRef.current) {
      try { supabase.removeChannel(chatChannelRef.current) } catch {}
      chatChannelRef.current = null
    }

    setActiveChat(chatId)
    setActiveChatUser(partner)
    activeChatRef.current = chatId

    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      setMessages(data || [])

      const channel = supabase
        .channel(`chat:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, (payload) => {
          // Не добавляем если уже есть в массиве (защита от дублей)
          setMessages((prev) => {
            const exists = prev.some(m => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new]
          })
        })
        .subscribe()

      chatChannelRef.current = channel
    } catch (err) {
      console.error('openChat error:', err)
    }
  }, [])

  const closeChat = useCallback(() => {
    if (chatChannelRef.current) {
      try { supabase.removeChannel(chatChannelRef.current) } catch {}
      chatChannelRef.current = null
    }
    setActiveChat(null)
    setActiveChatUser(null)
    setMessages([])
    activeChatRef.current = null
  }, [])

  const sendMessage = useCallback(async (content) => {
    if (!activeChatRef.current || !content.trim() || !user) return
    try {
      const { data } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChatRef.current,
          sender_username: user.username,
          content: content.trim()
        })
        .select()
        .single()
      if (data) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === data.id)
          if (exists) return prev
          return [...prev, data]
        })
        loadChats()
        return data
      }
    } catch (err) {
      console.error('sendMessage error:', err)
    }
  }, [user, loadChats])

  const sendMediaMessage = useCallback(async (mediaData) => {
    if (!activeChatRef.current || !mediaData || !user) return null
    try {
      const { data } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChatRef.current,
          sender_username: user.username,
          content: mediaData.url
        })
        .select()
        .single()
      if (data) {
        setMessages((prev) => [...prev, data])
        loadChats()
        return data
      }
    } catch (err) {
      console.error('sendMediaMessage error:', err)
    }
  }, [user, loadChats])

  const sendImageMessage = useCallback(async (file) => {
    if (!activeChatRef.current || !file || !user) return null
    try {
      const fileName = `photo_${user.username}_${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('message-media')
        .upload(fileName, file, { contentType: file.type || 'image/jpeg' })

      if (uploadError) {
        alert('Ошибка загрузки: ' + uploadError.message)
        return null
      }

      const { data: urlData } = supabase.storage
        .from('message-media')
        .getPublicUrl(fileName)

      const { data } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChatRef.current,
          sender_username: user.username,
          content: urlData.publicUrl
        })
        .select()
        .single()

      if (data) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === data.id)
          if (exists) return prev
          return [...prev, data]
        })
        loadChats()
        return data
      }
    } catch (err) {
      console.error('sendImageMessage error:', err)
    }
    return null
  }, [user, loadChats])

  useEffect(() => {
    if (listChannelRef.current) {
      try { supabase.removeChannel(listChannelRef.current) } catch {}
    }
    const channel = supabase
      .channel('chat_list_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        loadChats()
      })
      .subscribe()
    listChannelRef.current = channel
    return () => {
      if (listChannelRef.current) {
        try { supabase.removeChannel(listChannelRef.current) } catch {}
        listChannelRef.current = null
      }
    }
  }, [loadChats])

  return {
    chats,
    activeChat,
    activeChatUser,
    messages,
    loading,
    user,
    openChat,
    closeChat,
    sendMessage,
    sendMediaMessage,
    sendImageMessage,
    loadChats
  }
}
