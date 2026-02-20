import api from '../api/api'

export const proveedoresService = {
  listar: () => api.get('/proveedores'),
  crear: (data) => api.post('/proveedores', data),
  actualizar: (id, data) => api.put(`/proveedores/${id}`, data),
};