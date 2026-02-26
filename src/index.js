import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import { registerSW } from 'virtual:pwa-register'   // 👈 agregar esto

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)

// 👇 agregar esto abajo
registerSW({
  onOfflineReady() {
    console.log('App lista para instalar')
  },
  onNeedRefresh() {
    console.log('Nueva versión disponible')
  }
})