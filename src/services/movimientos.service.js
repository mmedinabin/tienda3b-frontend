import api from '../api/api'

export const movimientosService = {

  // ================= CREAR =================
  cargaInicial: (data) =>
    api.post('/movimientos/carga-inicial', data),

  ajuste: (data) =>
    api.post('/movimientos/ajuste', data),

  transferencia: (data) =>
    api.post('/movimientos/transferencia', data),

  // ================= CONSULTAR =================
  listar: (params = {}) =>
    api.get('/movimientos', { params }),

  obtener: (id) =>
    api.get(`/movimientos/${id}`),

  // ================= MODIFICAR =================
  anular: (id, motivo) =>
    api.put(`/movimientos/${id}/anular`, { motivo }),
}