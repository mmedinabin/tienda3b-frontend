import api from '../api/api';

export const ciudadesService = {
  listar: () => api.get('/ciudades'),
  crear: (data) => api.post('/ciudades', data),
};
