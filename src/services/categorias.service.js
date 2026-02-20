import api from '../api/api'

export const categoriasService = {
  listar: () => api.get('/categorias'),
  listarActivas: () => api.get('/categorias/activas'),
  crear: (data) => api.post('/categorias', data),
  actualizar: (id, data) => api.put(`/categorias/${id}`, data),
};
