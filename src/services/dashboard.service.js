import api from "../api/api"

const dashboardService = {
  obtener: () => api.get("/dashboard"),
}

export default dashboardService
