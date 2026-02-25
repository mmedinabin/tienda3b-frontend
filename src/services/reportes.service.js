import api from "../api/api"

const reportesService = {

  reporteComprasDetalle: (params) =>
    api.get("/reportes/compras-detalle", { params }),

  reporteVentasDetalle: (params) =>
    api.get("/reportes/ventas-detalle", { params }),

}

export default reportesService