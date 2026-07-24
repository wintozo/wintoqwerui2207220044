import { useLocation } from 'react-router-dom'
import MobileChat from '../mobile/MobileChat.jsx'
import ComputerChat from '../computer/ComputerChat.jsx'

export default function ChatRouter() {
  const location = useLocation()
  return location.pathname.includes('computer') ? <ComputerChat /> : <MobileChat />
}
