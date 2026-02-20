//import { useAuthStore } from '../store/auth.store'
import { useAuthStore } from '../store/auth.store'

export const usePermiso = () => {
  const permisos = useAuthStore((state) => state.permisos)

  const puedeVer = (modulo) =>
    permisos.some((p) => p.clave.toLowerCase() === modulo.toLowerCase() && p.puede_ver)

  const puedeCrear = (modulo) => permisos.some((p) => p.clave.toLowerCase() === modulo.toLowerCase() && p.puede_crear)

  const puedeEditar = (modulo) => permisos.some((p) => p.clave.toLowerCase() === modulo.toLowerCase() && p.puede_editar)

  const puedeEliminar = (modulo) => permisos.some((p) => p.clave.toLowerCase() === modulo.toLowerCase() && p.puede_eliminar)

  return {
    puedeVer,
    puedeCrear,
    puedeEditar,
    puedeEliminar,
  }
}
