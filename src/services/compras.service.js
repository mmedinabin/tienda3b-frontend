import api from '../api/api'

const comprasService = {
  crear: (data) => api.post('/compras', data),
  listar: () => api.get('/compras'),
  obtener: (id) => api.get(`/compras/${id}`),
  anular: (id, motivo) => api.put(`/compras/${id}/anular`, { motivo }),
}

export default comprasService
