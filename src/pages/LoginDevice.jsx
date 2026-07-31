import { useNavigate } from 'react-router-dom'
import { PhoneIcon, ComputerIcon } from '../components/Icons.jsx'

export default function LoginDevice() {
  const navigate = useNavigate()

  function handleSelect(device) {
    localStorage.setItem('wintozo_device', device)
    navigate(`/messenger/${device}/chat`, { replace: true })
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="logo">Wintozo</div>
        <div className="auth-subtitle">Выбери устройство</div>
        <div className="device-option" onClick={() => handleSelect('phone')}>
          <div className="device-icon-box"><PhoneIcon size={24} /></div>
          <div className="device-info">
            <div className="device-name">Телефон</div>
            <div className="device-desc">Мобильная версия</div>
          </div>
        </div>
        <div className="device-option" onClick={() => handleSelect('computer')}>
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
