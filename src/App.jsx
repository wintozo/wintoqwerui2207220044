import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Index from './pages/Index.jsx'
import Login from './pages/Login.jsx'
import LoginDevice from './pages/LoginDevice.jsx'
import RegistrationUsername from './pages/RegistrationUsername.jsx'
import RegistrationPassword from './pages/RegistrationPassword.jsx'
import RegistrationDevice from './pages/RegistrationDevice.jsx'
import ChatRouter from './pages/ChatRouter.jsx'
import SettingsRouter from './pages/SettingsRouter.jsx'
import SearchRouter from './pages/SearchRouter.jsx'
import BattlePage from './mobile/BattlePage.jsx'
import ProStatusPage from './mobile/ProStatusPage.jsx'
import ProCustomizePage from './mobile/ProCustomizePage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import MobileChat from './mobile/MobileChat.jsx'
import ComputerChat from './computer/ComputerChat.jsx'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="logo">Wintozo</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/messenger/login" element={<Login />} />
      <Route path="/messenger/login/device" element={<LoginDevice />} />
      <Route path="/messenger/registration/username" element={<RegistrationUsername />} />
      <Route path="/messenger/registration/password" element={<RegistrationPassword />} />
      <Route path="/messenger/registration/device/select" element={<RegistrationDevice />} />
      <Route path="/messenger/phone/chat" element={<MobileChat />} />
      <Route path="/messenger/phone/chat/user/:username" element={<UserProfilePage />} />
      <Route path="/messenger/computer/chat" element={<ComputerChat />} />
      <Route path="/messenger/computer/chat/user/:username" element={<UserProfilePage />} />
      <Route path="/messenger/phone/chat/search" element={<SearchRouter />} />
      <Route path="/messenger/computer/chat/search" element={<SearchRouter />} />
      <Route path="/messenger/phone/settings" element={<SettingsRouter />} />
      <Route path="/messenger/computer/settings" element={<SettingsRouter />} />
      <Route path="/messenger/battle" element={<BattlePage />} />
      <Route path="/messenger/status/pro" element={<ProStatusPage />} />
      <Route path="/messenger/settings/pro-customize" element={<ProCustomizePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
