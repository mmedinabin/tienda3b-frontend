import api from '../api/api'

export const sucursalesService = {
  listar: () => api.get('/sucursales'),
  listarActivas: () => api.get('/sucursales/activas'),
  crear: (data) => api.post('/sucursales', data),
  actualizar: (id, data) => api.put(`/sucursales/${id}`, data),
}