import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
// })

const api = axios.create({
  //baseURL: import.meta.env.VITE_API_URL,
  baseURL: import.meta.env.VITE_API_URL + '/api',
});

/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use(
  (config) => {
    const { token, sucursalActiva } = useAuthStore.getState()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (sucursalActiva) {
      config.headers['x-sucursal-activa'] = sucursalActiva
    }

    return config
  },
  (error) => Promise.reject(error)
)

/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState()
      logout()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api

// import axios from 'axios'
// import { useAuthStore } from '../store/auth.store'

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
// })

// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status

//     if (status === 401) {
//       const { logout } = useAuthStore.getState()

//       logout()
//       window.location.href = '/login'
//     }

//     return Promise.reject(error)
//   },
// )

// export default api
