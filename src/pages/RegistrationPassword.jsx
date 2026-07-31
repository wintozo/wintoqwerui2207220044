import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { LockIcon, ArrowRightIcon } from '../components/Icons.jsx'

export default function RegistrationPassword() {
  const navigate = useNavigate()
  const { regData, setRegData } = useAuth()
  const [password, setPassword] = useState(regData.password)
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  function handleNext() {
    setError('')
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }
    if (password !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    setRegData({ ...regData, password })
    navigate('/messenger/registration/device/select')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="logo">Wintozo</div>
        <div className="auth-subtitle">Придумай пароль</div>
        <div className="step-indicator">
          <div className="step-dot"></div>
          <div className="step-dot active"></div>
          <div className="step-dot"></div>
        </div>
        <div className="input-group">
          <label className="input-label">Пароль</label>
          <div className="input-wrapper">
            <div className="input-icon"><LockIcon size={18} /></div>
            <input className="input-field" type="password" placeholder="Минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Повторите пароль</label>
          <div className="input-wrapper">
            <div className="input-icon"><LockIcon size={18} /></div>
            <input className="input-field" type="password" placeholder="Повторите пароль" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn-primary" onClick={handleNext}>Далее <ArrowRightIcon size={18} /></button>
        <button className="btn-secondary" onClick={() => navigate('/messenger/registration/username')}>Назад</button>
        <Link to="/messenger/user/news/registration/privacy-policy/" className="auth-privacy-link">Политика конфиденциальности</Link>
      </div>
    </div>
  )
}
