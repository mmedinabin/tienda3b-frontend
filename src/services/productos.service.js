import api from '../api/api'

export const productosService = {
  listar: () => api.get('/productos'),
  obtener: (id) => api.get(`/productos/${id}`),
  crear: (data) => api.post('/productos', data),
  actualizar: (id, data) => api.put(`/productos/${id}`, data),
  cambiarEstado: (id, estado) => api.patch(`/productos/${id}/estado`, { estado }),
  listarPOS: () => api.get('/productos/pos'),
}
