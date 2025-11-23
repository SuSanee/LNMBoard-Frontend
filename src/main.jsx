import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializePushNotifications } from './services/pushNotificationService.js'

// Initialize push notifications on app load
if ('serviceWorker' in navigator) {
  initializePushNotifications().catch(console.error);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
