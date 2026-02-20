import api from '../api/api'

const comprasService = {
  crear: (data) => api.post('/compras', data),
  listar: () => api.get('/compras'),
  obtener: (id) => api.get(`/compras/${id}`),
}

export default comprasService
