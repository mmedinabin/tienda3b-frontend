import React, { useEffect, useState } from 'react'
import { CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilDollar, cilChartLine, cilCart, cilLayers, cilWarning } from '@coreui/icons'

import { useAuthStore } from '../../store/auth.store'
import dashboardService from '../../services/dashboard.service'

const Dashboard = () => {
  const { sucursalActiva } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [modoGlobal, setModoGlobal] = useState(false)
  const [data, setData] = useState(null)

  /* =============================
     REACTIVO A CAMBIO DE SUCURSAL
  ============================== */
  useEffect(() => {
    if (sucursalActiva === null) {
      setModoGlobal(true)
      setData(null)
      setLoading(false)
      return
    }

    setModoGlobal(false)
    setLoading(true)
    cargarDashboard()
  }, [sucursalActiva])

  /* =============================
     CARGAR DASHBOARD
  ============================== */
  const cargarDashboard = async () => {
    try {
      const res = await dashboardService.obtener()

      if (res.data.requiereSeleccionSucursal) {
        setModoGlobal(true)
        setData(null)
        return
      }

      setData(res.data)
    } catch (error) {
      console.error('Error cargando dashboard', error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  /* =============================
     FORMATO MONEDA
  ============================== */
  const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(valor || 0)

  /* =============================
     RENDER STATES
  ============================== */

  // Loading inicial o recarga
  if (loading) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  // Modo global (sin sucursal)
  if (modoGlobal) {
    return (
      <CCard className="text-center p-5">
        <CCardBody>
          <h4>Seleccione sucursal para ver reportes rápidos</h4>
          <p className="text-medium-emphasis">El dashboard requiere una sucursal activa.</p>
        </CCardBody>
      </CCard>
    )
  }

  // Protección extra por seguridad
  if (!data) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  /* =============================
     DASHBOARD PRINCIPAL
  ============================== */

  return (
    <>
      <CRow>
        {/* 💰 Venta Hoy */}
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-primary">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <CCardText>Venta Hoy</CCardText>
                  <CCardTitle className="fs-4 fw-bold">{formatearMoneda(data.ventaHoy)}</CCardTitle>
                </div>
                <CIcon icon={cilDollar} size="xl" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* 📈 Utilidad Hoy */}
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-success">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <CCardText>Utilidad Hoy</CCardText>
                  <CCardTitle className="fs-4 fw-bold">
                    {formatearMoneda(data.utilidadHoy)}
                  </CCardTitle>
                </div>
                <CIcon icon={cilChartLine} size="xl" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* 📆 Venta Semana */}
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-success">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <CCardText>Venta Semana</CCardText>
                  <CCardTitle className="fs-4 fw-bold">
                    {formatearMoneda(data.ventaSemana)}
                  </CCardTitle>
                </div>
                <CIcon icon={cilChartLine} size="xl" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* 📅 Venta Mes */}
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-info">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <CCardText>Venta Mes</CCardText>
                  <CCardTitle className="fs-4 fw-bold">{formatearMoneda(data.ventaMes)}</CCardTitle>
                </div>
                <CIcon icon={cilCart} size="xl" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* 🔵 Segunda fila */}
      <CRow>
        {/* 🧾 Tickets Hoy */}
        <CCol sm={6} lg={6}>
          <CCard className="mb-4 border-start border-start-4 border-start-primary">
            <CCardBody>
              <CCardText>Tickets Hoy</CCardText>
              <CCardTitle className="fs-4 fw-bold">{data.ticketsHoy}</CCardTitle>
            </CCardBody>
          </CCard>
        </CCol>

        {/* 🚨 Bajo Stock */}
        <CCol sm={6} lg={6}>
          <CCard className="mb-4 border-start border-start-4 border-start-danger">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <CCardText>Productos Bajo Stock</CCardText>
                  <CCardTitle className="fs-4 fw-bold text-danger">
                    {data.productosBajoStock}
                  </CCardTitle>
                </div>
                <CIcon icon={cilWarning} size="xl" className="text-danger" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* 📦 Inventario */}
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-dark">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <CCardText>Inventario Valorizado</CCardText>
                  <CCardTitle className="fs-4 fw-bold">
                    {formatearMoneda(data.inventarioValorizado)}
                  </CCardTitle>
                </div>
                <CIcon icon={cilLayers} size="xl" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        {/* 📦 Productos Catálogo */}
        <CCol sm={6} lg={6}>
          <CCard className="mb-4 text-white bg-secondary">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <CCardText>Productos en Catálogo</CCardText>
                  <CCardTitle className="fs-4 fw-bold">{data.totalProductos}</CCardTitle>
                </div>
                <CIcon icon={cilLayers} size="xl" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* 📦 Unidades Totales */}
        <CCol sm={6} lg={6}>
          <CCard className="mb-4 text-white bg-warning">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <CCardText>Unidades en Inventario</CCardText>
                  <CCardTitle className="fs-4 fw-bold">{data.totalUnidades} pzas</CCardTitle>
                </div>
                <CIcon icon={cilLayers} size="xl" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
