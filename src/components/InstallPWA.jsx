import { useEffect, useState } from 'react'

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
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
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('Instalada')
    }

    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <button
      onClick={installApp}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        padding: '10px 16px',
        background: '#0d6efd',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
      }}
    >
      Instalar App
    </button>
  )
}

export default InstallPWA