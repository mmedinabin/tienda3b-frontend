import api from '../api/api'

export const clientesService = {
  listar: () => api.get('/clientes'),
  crear: (data) => api.post('/clientes', data),
  actualizar: (id, data) => api.put(`/clientes/${id}`, data),
};