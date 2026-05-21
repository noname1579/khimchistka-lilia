import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'  // <- ЭТО ВАЖНО!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    <App />
  </React.StrictMode>,
)