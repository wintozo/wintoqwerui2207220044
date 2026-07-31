import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { PhoneIcon, ComputerIcon } from '../components/Icons.jsx'

export default function RegistrationDevice() {
  const navigate = useNavigate()
  const { regData, signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSelect(device) {
    setError('')
    setLoading(true)
    
    // Если пользователь уже зарегистрирован — просто меняем устройство
    const savedUsername = localStorage.getItem('wintozo_username')
    if (savedUsername) {
      localStorage.setItem('wintozo_device', device)
      navigate(`/messenger/${device}/chat`, { replace: true })
      setLoading(false)
      return
    }
    
    // Новая регистрация
    const { error: signUpError } = await signUp(regData.nickname, regData.username, regData.password)
    if (signUpError) {
      setError(signUpError.message || 'Ошибка регистрации')
      setLoading(false)
      return
    }
    localStorage.setItem('wintozo_device', device)
    navigate(`/messenger/${device}/chat`, { replace: true })
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="logo">Wintozo</div>
        <div className="auth-subtitle">Выбери устройство</div>
        <div className="step-indicator">
          <div className="step-dot"></div>
          <div className="step-dot"></div>
          <div className="step-dot active"></div>
        </div>
        {error && <div className="error-text">{error}</div>}
        <div className="device-option" onClick={() => !loading && handleSelect('phone')}>
          <div className="device-icon-box"><PhoneIcon size={24} /></div>
          <div className="device-info">
            <div className="device-name">Телефон</div>
            <div className="device-desc">Мобильная версия</div>
          </div>
        </div>
        <div className="device-option" onClick={() => !loading && handleSelect('computer')}>
          <div className="device-icon-box"><ComputerIcon size={24} /></div>
          <div className="device-info">
            <div className="device-name">Компьютер</div>
            <div className="device-desc">Полноценная версия</div>
          </div>
        </div>
        <Link to="/messenger/user/news/registration/privacy-policy/" className="auth-privacy-link">Политика конфиденциальности</Link>
      </div>
    </div>
  )
}
