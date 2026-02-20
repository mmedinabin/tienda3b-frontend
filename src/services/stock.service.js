import api from "../api/api";

const stockService = {
  listar: (sucursalId) =>
    api.get(`/stock?sucursal_id=${sucursalId}`),
};

export default stockService;
