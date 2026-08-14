import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Vista móvil al 90%. Se decide con screen.width (ancho físico del dispositivo),
// no con innerWidth ni con una media query: ambos cambian al aplicar el zoom y
// producirían un bucle de activación/desactivación.
if (typeof window !== 'undefined' && window.screen?.width < 768) {
  document.documentElement.style.zoom = '0.9'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
