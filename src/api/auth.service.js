import api from './api'

// export const loginRequest = async (login, password) => {
//   const { data } = await api.post('/auth/login', {
//     login,   // 👈 aquí está el fix
//     password,
//   })
//   return data
// }
export const loginRequest = async (login, password) => {
  const { data } = await api.post('/api/auth/login', {
    login,
    password,
  })
  return data
}



export const getPerfil = async () => {
  const { data } = await api.get('/auth/perfil')
  return data
}
