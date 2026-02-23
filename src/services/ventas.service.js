// import api from '../api/api'

// export const ventasService = async (payload) => {
//   const { data } = await api.post("/ventas", payload);
//   return data;
// };


// import api from '../api/api'

// const ventasService = {
//   crear: (data) => api.post('/ventas', data),
//   listar: () => api.get('/ventas'),
//   obtener: (id) => api.get(`/ventas/${id}`),
//   pdf: (id) =>
//     api.get(`/ventas/${id}/pdf`, { responseType: 'blob' }),
// }

// export default ventasService


import api from '../api/api'

export const ventasService = {
  crear: (data) => api.post('/ventas', data),
  listar: () => api.get('/ventas'),
  obtener: (id) => api.get(`/ventas/${id}`),
  pdf: (id) =>
    api.get(`/ventas/${id}/pdf`, { responseType: 'blob' }),
}