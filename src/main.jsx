import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { AuthSession } from './components/auth/AuthSession.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthSession>
        <App />
      </AuthSession>
    </BrowserRouter>
  </StrictMode>,
)
