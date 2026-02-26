import { useEffect, useState } from 'react'

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Si ya se mostró antes, no hacer nada
    if (localStorage.getItem('pwaPromptShown')) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Solo mostrar en login
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
    const { outcome } = await deferredPrompt.userChoice

    // Guardamos que ya se mostró (instale o no)
    localStorage.setItem('pwaPromptShown', 'true')

    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar')
    }

    setVisible(false)
    setDeferredPrompt(null)
  }

  // Si no es visible, no renderizar nada
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
