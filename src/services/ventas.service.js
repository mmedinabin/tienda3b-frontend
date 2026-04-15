import api from '../api/api'

export const ventasService = {
  crear: (data) => api.post('/ventas', data),

  listar: () => api.get('/ventas'),

  obtener: (id) => api.get(`/ventas/${id}`),

  pdf: (id) => api.get(`/ventas/${id}/pdf`, { responseType: 'blob' }),

  anular: (id, motivo) => api.put(`/ventas/${id}/anular`, { motivo }),
  
  reemplazar: (id, data) => api.put(`/ventas/${id}/reemplazar`, data),
}
