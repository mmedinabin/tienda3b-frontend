import { useEffect, useState } from 'react'

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

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

  // Solo mostrar en login (HashRouter)
  if (!window.location.hash.includes('/login')) return null

  if (!visible) return null

  // No mostrar si ya está instalada
  if (window.matchMedia('(display-mode: standalone)').matches) return null

  return (
    <button
      onClick={installApp}
      className="btn btn-primary"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        borderRadius: '50px',
        padding: '10px 18px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      📲 Instalar App
    </button>
  )
}

export default InstallPWA