import { useEffect, useState } from 'react'

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Solo mostrar si está en login
      if (window.location.hash === '#/login') {
        setVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    await deferredPrompt.userChoice

    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <button onClick={installApp} className="btn btn-primary">
        Instalar aplicación
      </button>
    </div>
  )
}

export default InstallPWA