import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { AtIcon, UserIcon, ArrowRightIcon } from '../components/Icons.jsx'

export default function RegistrationUsername() {
  const navigate = useNavigate()
  const { regData, setRegData, user } = useAuth()
  const [nickname, setNickname] = useState(regData.nickname)
  const [username, setUsername] = useState(regData.username)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      const device = localStorage.getItem('wintozo_device') || 'phone'
      navigate(`/messenger/${device}/chat`, { replace: true })
    }
  }, [user, navigate])

  function handleNext() {
    setError('')
    if (nickname.trim().length < 2) {
      setError('Никнейм должен содержать минимум 2 символа')
      return
    }
    if (username.trim().length < 3) {
      setError('Юзернейм должен содержать минимум 3 символа')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Юзернейм — латиница, цифры и _')
      return
    }
    setRegData({ ...regData, nickname: nickname.trim(), username: username.trim() })
    navigate('/messenger/registration/password')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="logo">Wintozo</div>
        <div className="auth-subtitle">Создай новый аккаунт</div>
        <div className="step-indicator">
          <div className="step-dot active"></div>
          <div className="step-dot"></div>
          <div className="step-dot"></div>
        </div>
        <div className="input-group">
          <label className="input-label">Никнейм</label>
          <div className="input-wrapper">
            <div className="input-icon"><UserIcon size={18} /></div>
            <input className="input-field" type="text" placeholder="Как тебя видят другие" value={nickname} onChange={(e) => setNickname(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Юзернейм</label>
          <div className="input-wrapper">
            <div className="input-icon"><AtIcon size={18} /></div>
            <input className="input-field" type="text" placeholder="@username" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn-primary" onClick={handleNext}>Далее <ArrowRightIcon size={18} /></button>
        <Link to="/messenger/login" className="auth-link">Уже есть аккаунт? Войти</Link>
      </div>
    </div>
  )
}
