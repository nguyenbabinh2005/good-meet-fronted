import React from 'react'
import ReactDOM from 'react-dom/client'
import '@livekit/components-styles'
import './app/styles/tailwind.css'
import './app/styles/globals.scss'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
