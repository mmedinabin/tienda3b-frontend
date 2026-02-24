import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { ventasService } from '../../services/ventas.service'
import SmartTable from '../../components/SmartTable'
import { useAuthStore } from '../../store/auth.store'
import Swal from 'sweetalert2'

const Ventas = () => {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)

  const sucursalActiva = useAuthStore((state) => state.sucursalActiva)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const abrirDetalle = (venta) => {
    setVentaSeleccionada(venta)
  }

  useEffect(() => {
    if (!sucursalActiva) return

    setCargando(true)
    setVentas([])

    cargarVentas()
  }, [sucursalActiva])

  //   const cargarVentas = async () => {
  //     try {
  //       const { data } = await ventasService.listar()
  //       setVentas(data)
  //     } catch (error) {
  //       console.error(error)
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error cargando ventas',
  //       })
  //     } finally {
  //       setCargando(false)
  //     }
  //   }
  const cargarVentas = async () => {
    try {
      const { data } = await ventasService.listar()

      console.log(
        data.map((v) => ({
          id: v.id,
          codigo: v.codigo,
          fecha: v.fecha,
        })),
      )

      setVentas(data)
    } catch (error) {
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  const descargarPDF = async (row) => {
    try {
      const response = await ventasService.pdf(row.id)
      const blob = response.data
      const url = window.URL.createObjectURL(blob)

      const isMobile = window.innerWidth < 768

      if (isMobile) {
        const link = document.createElement('a')
        link.href = url
        link.download = `venta-${row.codigo}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        window.open(url, '_blank')
      }

      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Error al generar PDF',
      })
    }
  }

  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      style: { fontFamily: 'monospace', fontSize: '0.9rem' },
    },
    {
      key: 'fecha',
      label: 'Fecha y Hora',
      render: (row) => new Date(row.fecha).toLocaleString(),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (row) => {
        const esGeneral = row.cliente_id === 0 || !row.cliente || row.cliente === 'SIN NOMBRE'

        return esGeneral ? <span className="text-muted">General</span> : row.cliente
      },
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      style: { whiteSpace: 'nowrap' },
    },
    {
      key: 'tipo_pago',
      label: 'Tipo pago',
      render: (row) => {
        const colors = {
          EFECTIVO: 'success',
          TRANSFERENCIA: 'info',
          CREDITO: 'warning',
        }

        return <CBadge color={colors[row.tipo_pago] || 'secondary'}>{row.tipo_pago}</CBadge>
      },
    },
    {
      key: 'total',
      label: 'Total',
      style: { textAlign: 'right' },
      render: (row) => <strong>Bs {Number(row.total).toFixed(2)}</strong>,
    },
    {
      key: 'saldo',
      label: 'Saldo',
      render: (row) => (
        <span className={row.saldo > 0 ? 'text-warning' : 'text-muted'}>
          Bs {Number(row.saldo).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) =>
        row.estado === 'ANULADA' ? (
          <CBadge color="danger">Anulada</CBadge>
        ) : row.saldo > 0 ? (
          <CBadge color="warning">Pendiente</CBadge>
        ) : (
          <CBadge color="success">Pagado</CBadge>
        ),
    },
    {
      key: 'acciones',
      label: '',
      render: (row) => (
        <CButton size="sm" color="info" onClick={() => descargarPDF(row)}>
          Ver PDF
        </CButton>
      ),
    },
  ]

  //   const VentaCard = ({ row, index }) => {
  //     const esGeneral = row.cliente_id === 0 || !row.cliente || row.cliente === 'SIN NOMBRE'

  //     return (
  //       <CCard
  //         className="mb-3 shadow-sm"
  //         style={{
  //           borderRadius: 14,
  //           border: '1px solid #e5e7eb',
  //         }}
  //       >
  //         <CCardBody className="p-3">
  //           {/* Header */}
  //           <div className="d-flex justify-content-between align-items-center mb-2">
  //             <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
  //               #{index + 1} · {row.codigo}
  //             </span>

  //             <CBadge
  //               color={row.estado === 'ANULADA' ? 'danger' : row.saldo > 0 ? 'warning' : 'success'}
  //             >
  //               {row.estado === 'ANULADA' ? 'Anulada' : row.saldo > 0 ? 'Pendiente' : 'Pagado'}
  //             </CBadge>
  //           </div>

  //           {/* Fecha */}
  //           <div className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>
  //             {new Date(row.fecha).toLocaleString()}
  //           </div>

  //           {/* Cliente + Tipo */}
  //           <div className="d-flex justify-content-between align-items-center mb-2">
  //             <span style={{ fontSize: '0.85rem' }}>{esGeneral ? 'General' : row.cliente}</span>

  //             <CBadge
  //               color={
  //                 row.tipo_pago === 'EFECTIVO'
  //                   ? 'success'
  //                   : row.tipo_pago === 'TRANSFERENCIA'
  //                     ? 'info'
  //                     : 'warning'
  //               }
  //             >
  //               {row.tipo_pago}
  //             </CBadge>
  //           </div>

  //           {/* Total */}
  //           <div className="d-flex justify-content-between align-items-center mb-3">
  //             <span className="text-muted" style={{ fontSize: '0.8rem' }}>
  //               Total
  //             </span>
  //             <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
  //               Bs {Number(row.total).toFixed(2)}
  //             </span>
  //           </div>

  //           <CButton size="sm" color="primary" className="w-100" onClick={() => descargarPDF(row)}>
  //             Ver PDF
  //           </CButton>
  //         </CCardBody>
  //       </CCard>
  //     )
  //   }
  const VentaCard = ({ row, index }) => {
    const esGeneral = row.cliente_id === 0 || !row.cliente || row.cliente === 'SIN NOMBRE'

    return (
      <CCard
        className="mb-3 shadow-sm"
        style={{
          borderRadius: 14,
          border: '1px solid #e5e7eb',
        }}
      >
        <CCardBody className="p-3">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
              #{index + 1} · {row.codigo}
            </span>

            <CBadge
              color={row.estado === 'ANULADA' ? 'danger' : row.saldo > 0 ? 'warning' : 'success'}
            >
              {row.estado === 'ANULADA' ? 'Anulada' : row.saldo > 0 ? 'Pendiente' : 'Pagado'}
            </CBadge>
          </div>

          {/* Fecha + Tipo pago */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              {new Date(row.fecha).toLocaleString()}
            </span>

            <CBadge
              color={
                row.tipo_pago === 'EFECTIVO'
                  ? 'success'
                  : row.tipo_pago === 'TRANSFERENCIA'
                    ? 'info'
                    : 'warning'
              }
            >
              {row.tipo_pago}
            </CBadge>
          </div>

          {/* Cliente alineado */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Cliente
            </span>
            <span style={{ fontSize: '0.85rem' }}>{esGeneral ? 'General' : row.cliente}</span>
          </div>

          {/* Total */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Total
            </span>
            <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
              Bs {Number(row.total).toFixed(2)}
            </span>
          </div>

          {/* Botón principal */}
          <CButton size="sm" color="primary" className="w-100" onClick={() => abrirDetalle(row)}>
            Ver detalle
          </CButton>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Historial de Ventas</h4>

        <CButton color="primary" onClick={() => navigate('/ventas')}>
          Nueva venta
        </CButton>
      </div>

      {!sucursalActiva ? (
        <CCard>
          <CCardBody className="text-center py-5">
            <div className="mb-3" style={{ fontSize: '2rem' }}>
              🏢
            </div>

            <h5 className="fw-semibold mb-2">Seleccione una sucursal para ver las ventas.</h5>
          </CCardBody>
        </CCard>
      ) : (
        <CCard>
          <CCardBody>
            {cargando ? (
              <div className="text-center p-4">
                <CSpinner color="primary" />
              </div>
            ) : ventas.length === 0 ? (
              <div className="text-center text-muted p-4">No existen ventas registradas</div>
            ) : (
              //   <SmartTable columns={columns} data={ventas} pageSize={10} />
              <>
                {/* 📱 Mobile */}
                <div className="d-md-none">
                  {ventas.map((venta, index) => (
                    <VentaCard key={venta.id} row={venta} index={index} />
                  ))}
                </div>

                {/* 🖥 Desktop */}
                <div className="d-none d-md-block">
                  <SmartTable columns={columns} data={ventas} pageSize={10} />
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      )}

      <CModal
        visible={!!ventaSeleccionada}
        onClose={() => setVentaSeleccionada(null)}
        alignment="center"
        scrollable
      >
        <CModalHeader>
          <CModalTitle style={{ fontSize: '1rem' }}>Detalle de Venta</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {ventaSeleccionada && (
            <>
              {/* HEADER */}
              <div className="mb-3">
                <div className="fw-semibold">{ventaSeleccionada.codigo}</div>

                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {new Date(ventaSeleccionada.fecha).toLocaleString()}
                </div>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Cliente</span>
                <span>
                  {ventaSeleccionada.cliente === 'SIN NOMBRE'
                    ? 'General'
                    : ventaSeleccionada.cliente}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tipo pago</span>
                <CBadge color="success">{ventaSeleccionada.tipo_pago}</CBadge>
              </div>

              <div className="border-top my-3" style={{ opacity: 0.2 }} />

              {/* PRODUCTOS */}
              <div className="text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: 1 }}>
                PRODUCTOS
              </div>

              {ventaSeleccionada.productos.map((item, i) => (
                <div key={i} className="mb-3">
                  <div style={{ fontSize: '0.9rem' }}>
                    {i + 1}. {item.producto}
                  </div>

                  <div
                    className="d-flex justify-content-between text-muted"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <span>
                      {item.cantidad} x Bs {Number(item.precio_unitario).toFixed(2)}
                    </span>

                    <span>Bs {Number(item.subtotal).toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <div className="border-top my-3" style={{ opacity: 0.2 }} />

              {/* TOTAL */}
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Total</span>
                <span className="fw-bold" style={{ fontSize: '1.3rem' }}>
                  Bs {Number(ventaSeleccionada.total).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <CButton color="light" onClick={() => setVentaSeleccionada(null)}>
            Cerrar
          </CButton>

          {ventaSeleccionada && (
            <CButton color="primary" onClick={() => descargarPDF(ventaSeleccionada)}>
              Descargar PDF
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Ventas
