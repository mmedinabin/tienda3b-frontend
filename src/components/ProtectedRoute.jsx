import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { usePermiso } from '../hooks/usePermiso'

const ProtectedRoute = ({ modulo, accion = 'ver', children }) => {
  const { token, hasHydrated } = useAuthStore()
  //const token = useAuthStore((state) => state.token)
  const { puedeVer, puedeCrear, puedeEditar, puedeEliminar } = usePermiso()

  // 🟡 Esperar a que persist termine
  if (!hasHydrated) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (modulo) {
    let permitido = false

    switch (accion) {
      case 'crear':
        permitido = puedeCrear(modulo)
        break
      case 'editar':
        permitido = puedeEditar(modulo)
        break
      case 'eliminar':
        permitido = puedeEliminar(modulo)
        break
      default:
        permitido = puedeVer(modulo)
    }

    if (!permitido) {
      return <Navigate to="/403" replace />
    }
  }

  return children
}

export default ProtectedRoute
