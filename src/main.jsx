import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

function ErrorFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1a2e',
      color: '#fff',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Wintozo</div>
      <div style={{ fontSize: '14px', textAlign: 'center', opacity: 0.8 }}>
        Ошибка загрузки. Проверьте подключение к интернету.
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 24px',
          fontSize: '14px',
          backgroundColor: '#6c63ff',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Перезагрузить
      </button>
    </div>
  )
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
} catch (error) {
  console.error('App render error:', error)
  document.getElementById('root').innerHTML = ''
  const fallback = document.createElement('div')
  fallback.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;background-color:#1a1a2e;color:#fff;flex-direction:column;gap:16px;padding:20px;"><div style="font-size:24px;font-weight:bold;">Wintozo</div><div style="font-size:14px;text-align:center;opacity:0.8;">Ошибка загрузки. Проверьте подключение к интернету.</div><button onclick="location.reload()" style="padding:10px 24px;font-size:14px;background-color:#6c63ff;color:#fff;border:none;border-radius:8px;cursor:pointer;">Перезагрузить</button></div>'
  document.getElementById('root').appendChild(fallback)
}
