import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (localStorage.getItem('pwaPromptShown')) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    await deferredPrompt.userChoice

    localStorage.setItem('pwaPromptShown', 'true')
    setVisible(false)
    setDeferredPrompt(null)
  }

  // 👇 SOLO mostrar en login
  if (location.pathname !== '/login') return null

  if (!visible) return null

  if (window.matchMedia('(display-mode: standalone)').matches) return null

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <button onClick={installApp} className="btn btn-primary">
        Instalar aplicación
      </button>
    </div>
  )
}

export default InstallPWA