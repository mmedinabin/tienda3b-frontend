import React, { useState } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CBadge
} from "@coreui/react"

const RptVentas = () => {
  const [tipo, setTipo] = useState("HOY")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock temporal
  const resumen = {
    totalVentas: 25,
    totalIngresos: 12500,
    totalUtilidad: 3200,
    ticketPromedio: 500,
    ventasCredito: 1500
  }

  const ventas = [
    {
      codigo: "V-0001",
      fecha: "2026-02-24",
      tipo_pago: "EFECTIVO",
      total: 250,
      saldo: 0,
      estado_pago: "PAGADO"
    }
  ]

  const handleBuscar = () => {
    setLoading(true)
    // aquí irá llamada a tu endpoint
    setTimeout(() => setLoading(false), 800)
  }

  const mostrarPersonalizado = tipo === "PERSONALIZADO"

  return (
    <>
      {/* FILTROS */}
      <CCard className="mb-4">
        <CCardHeader>Reporte de Ventas</CCardHeader>
        <CCardBody>
          <CRow className="align-items-end">
            <CCol md={3}>
              <label>Tipo de Reporte</label>
              <CFormSelect
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="HOY">Hoy</option>
                <option value="SEMANA">Semana</option>
                <option value="MES">Mes</option>
                <option value="PERSONALIZADO">Entre Fechas</option>
              </CFormSelect>
            </CCol>

            {mostrarPersonalizado && (
              <>
                <CCol md={3}>
                  <label>Fecha Inicio</label>
                  <CFormInput
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </CCol>

                <CCol md={3}>
                  <label>Fecha Fin</label>
                  <CFormInput
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </CCol>
              </>
            )}

            <CCol md={2}>
              <CButton color="primary" className="w-100" onClick={handleBuscar}>
                {loading ? <CSpinner size="sm" /> : "Buscar"}
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* RESUMEN */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CCard className="text-center">
            <CCardBody>
              <h6>Total Ventas</h6>
              <h4>{resumen.totalVentas}</h4>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={3}>
          <CCard className="text-center">
            <CCardBody>
              <h6>Total Ingresos</h6>
              <h4>Bs {resumen.totalIngresos}</h4>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={3}>
          <CCard className="text-center">
            <CCardBody>
              <h6>Total Utilidad</h6>
              <h4>Bs {resumen.totalUtilidad}</h4>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={3}>
          <CCard className="text-center">
            <CCardBody>
              <h6>Ticket Promedio</h6>
              <h4>Bs {resumen.ticketPromedio}</h4>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* BOTONES EXPORTAR */}
      <CRow className="mb-3">
        <CCol className="text-end">
          <CButton color="success" className="me-2">
            Exportar Excel
          </CButton>
          <CButton color="danger">
            Exportar PDF
          </CButton>
        </CCol>
      </CRow>

      {/* TABLA */}
      <CCard>
        <CCardHeader>Listado de Ventas</CCardHeader>
        <CCardBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Código</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Tipo Pago</CTableHeaderCell>
                <CTableHeaderCell>Total</CTableHeaderCell>
                <CTableHeaderCell>Saldo</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {ventas.map((v, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{v.codigo}</CTableDataCell>
                  <CTableDataCell>{v.fecha}</CTableDataCell>
                  <CTableDataCell>{v.tipo_pago}</CTableDataCell>
                  <CTableDataCell>Bs {v.total}</CTableDataCell>
                  <CTableDataCell>Bs {v.saldo}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge
                      color={v.estado_pago === "PAGADO" ? "success" : "warning"}
                    >
                      {v.estado_pago}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default RptVentas