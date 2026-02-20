import api from '../api/api'

export const crearEmpleado = (data) =>
  api.post('/empleados', data)

export const obtenerUsuariosDisponibles = () =>
  api.get('/empleados/usuarios-disponibles')

export const listarEmpleados = () =>
  api.get('/empleados')

export const cambiarEstadoEmpleado = (id) =>
  api.patch(`/empleados/${id}/estado`)

export const obtenerEmpleado = (id) =>
  api.get(`/empleados/${id}`)

export const actualizarEmpleado = (id, data) =>
  api.put(`/empleados/${id}`, data)