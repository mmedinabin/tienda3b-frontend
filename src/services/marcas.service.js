import api from '../api/api'

export const marcasService = {
  listar: () => api.get('/marcas'),
  crear: (data) => api.post('/marcas', data),
};