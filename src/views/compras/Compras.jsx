import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/auth.store'
import {
  CCard,
  CCardBody,
  CButton,
  CBadge,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import comprasService from '../../services/compras.service'
import SmartTable from '../../components/SmartTable'

const Compras = () => {
  const sucursalActiva = useAuthStore((state) => state.sucursalActiva)

  const navigate = useNavigate()
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [compraSeleccionada, setCompraSeleccionada] = useState(null)

  const permisos = useAuthStore((state) => state.permisos)

  const puedeAnular = permisos?.some((p) => p.clave === 'COMPRAS' && p.puede_eliminar === 1)

  const puedeOperar = !!sucursalActiva

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


  const cargarCompras = async () => {
    try {
      setCargando(true)
      const { data } = await comprasService.listar()
      console.log(data);
      setCompras(data.data ?? data)
    } catch (error) {
      console.error('Error cargando compras', error)
      setCompras([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCompras()
  }, [sucursalActiva])

  const columns = [
    {
      key: 'codigo',
      label: 'Código',
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (row) => new Date(row.fecha).toLocaleDateString(),
    },
    {
      key: 'proveedor',
      label: 'Proveedor',
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      style: { whiteSpace: 'nowrap' },
    },
    {
      key: 'tipo_pago',
      label: 'Tipo pago',
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => `Bs ${Number(row.total).toFixed(2)}`,
    },
    {
      key: 'saldo',
      label: 'Saldo',
      render: (row) => `Bs ${Number(row.saldo).toFixed(2)}`,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => {
        if (row.estado === 'ANULADA') return <CBadge color="danger">Anulada</CBadge>

        if (row.estado === 'PARCIAL') return <CBadge color="warning">Parcial</CBadge>

        if (row.estado === 'PAGADA') return <CBadge color="success">Pagada</CBadge>

        return <CBadge color="secondary">Pendiente</CBadge>
      },
    },
    {
      key: 'acciones',
      label: '',
      render: (row) => (
        <div className="d-flex gap-2">
          <CButton
            size="sm"
            color="info"
            variant="outline"
            onClick={() => setCompraSeleccionada(row)}
          >
            Ver
          </CButton>

          <CButton size="sm" color="primary" variant="outline" onClick={() => descargarPDF(row)}>
            PDF
          </CButton>

          {puedeOperar && puedeAnular && row.estado !== 'ANULADA' && (
            <CButton size="sm" color="danger" variant="outline" onClick={() => handleAnular(row)}>
              Anular
            </CButton>
          )}
        </div>
      ),
    },
  ]

  const descargarPDF = async (row) => {
    try {
      const token = useAuthStore.getState().token

      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Sesión expirada',
        })
        return
      }

      const response = await fetch(`${API_URL}/api/compras/${row.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('No autorizado')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const isMobile = window.innerWidth < 768

      if (isMobile) {
        // 📱 Descarga directa
        const link = document.createElement('a')
        link.href = url
        link.download = `compra-${row.codigo}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // 🖥 Ventana nueva controlada (mejor UX que pestaña simple)
        window.open(url, '_blank', 'width=900,height=700,noopener,noreferrer')
      }

      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al generar PDF',
      })
    }
  }
  const descargarPDFDirecto = async (row) => {
    try {
      const token = useAuthStore.getState().token
      if (!token) return

      const response = await fetch(`${API_URL}/api/compras/${row.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error()

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `compra-${row.codigo}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al generar PDF',
      })
    }
  }

  const handleAnular = async (compra) => {
    const { value: motivo } = await Swal.fire({
      title: 'Anular compra',
      input: 'text',
      inputLabel: 'Motivo de anulación',
      inputPlaceholder: 'Ej: Error en proveedor',
      inputValidator: (value) => {
        if (!value) return 'Debe ingresar un motivo'
      },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Anular',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async (motivo) => {
        try {
          await comprasService.anular(compra.id, motivo)
          return true
        } catch (error) {
          Swal.showValidationMessage(error.response?.data?.message || 'Error al anular')
        }
      },
    })

    if (motivo) {
      await cargarCompras()
      setCompraSeleccionada(null)

      Swal.fire({
        icon: 'success',
        title: 'Compra anulada correctamente',
      })
    }
  }

  const CompraCard = ({ row, index }) => {
    let estado = row.estado
    let colorEstado = 'secondary'

    switch (row.estado) {
      case 'ANULADA':
        estado = 'Anulada'
        colorEstado = 'danger'
        break
      case 'PARCIAL':
        estado = 'Parcial'
        colorEstado = 'warning'
        break
      case 'PAGADA':
        estado = 'Pagada'
        colorEstado = 'success'
        break
      case 'PENDIENTE':
        estado = 'Pendiente'
        colorEstado = 'secondary'
        break
      default:
        estado = row.estado
    }

    return (
      <CCard
        className="mb-3"
        style={{
          backgroundColor: '#f8f9fb',
          borderRadius: '20px',
          border: '1px solid #dee0e0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        }}
      >
        <CCardBody className="p-3">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
              #{index + 1} · {row.codigo}
            </span>
            <CBadge color={colorEstado}>{estado}</CBadge>
          </div>

          {/* Fecha + Tipo pago */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              {new Date(row.fecha).toLocaleDateString('es-BO')}
            </span>

            <CBadge color="info">{row.tipo_pago}</CBadge>
          </div>

          {/* Proveedor */}
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Proveedor
            </span>
            <span style={{ fontSize: '0.85rem' }}>{row.proveedor}</span>
          </div>

          {/* Sucursal */}
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Sucursal
            </span>
            <span style={{ fontSize: '0.85rem' }}>{row.sucursal}</span>
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

          {/* Botón */}
          <div className="d-flex gap-2">
            <CButton
              size="sm"
              color="info"
              className="w-100"
              onClick={() => setCompraSeleccionada(row)}
            >
              Ver detalle
            </CButton>

            <CButton size="sm" color="primary" className="w-100" onClick={() => descargarPDF(row)}>
              PDF
            </CButton>

            {puedeOperar && puedeAnular && row.estado !== 'ANULADA' && (
              <CButton size="sm" color="danger" className="w-100" onClick={() => handleAnular(row)}>
                Anular
              </CButton>
            )}
          </div>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Historial de Compras</h4>

        <CButton color="primary" onClick={() => navigate('/compras/nuevo')}>
          Nueva compra
        </CButton>
      </div>

      <CCard>
        <CCardBody>
          {cargando ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
            </div>
          ) : compras.length === 0 ? (
            <div className="text-center text-muted p-4">No existen compras registradas</div>
          ) : (
            <>
              {/* 📱 Mobile */}
              <div className="d-md-none">
                {compras.map((compra, index) => (
                  <CompraCard key={compra.id} row={compra} index={index} />
                ))}
              </div>

              {/* 🖥 Desktop */}
              <div className="d-none d-md-block">
                <SmartTable columns={columns} data={compras} pageSize={10} />
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      <CModal
        visible={!!compraSeleccionada}
        onClose={() => setCompraSeleccionada(null)}
        alignment="center"
        scrollable
      >
        <CModalHeader>
          <CModalTitle style={{ fontSize: '1rem' }}>Detalle de Compra</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {compraSeleccionada && (
            <>
              {/* HEADER */}
              <div className="mb-3">
                <div className="fw-semibold">{compraSeleccionada.codigo}</div>

                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {new Date(compraSeleccionada.fecha).toLocaleDateString('es-BO')}
                </div>
              </div>

              {/* Proveedor */}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Proveedor</span>
                <span>{compraSeleccionada.proveedor}</span>
              </div>

              {/* Sucursal */}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Sucursal</span>
                <span>{compraSeleccionada.sucursal}</span>
              </div>

              {/* Tipo pago */}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tipo pago</span>
                <CBadge color={compraSeleccionada.tipo_pago === 'CONTADO' ? 'success' : 'warning'}>
                  {compraSeleccionada.tipo_pago}
                </CBadge>
              </div>

              {/* Estado */}
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Estado</span>
                <CBadge
                  color={
                    compraSeleccionada.estado === 'ANULADA'
                      ? 'danger'
                      : compraSeleccionada.estado === 'PARCIAL'
                        ? 'warning'
                        : compraSeleccionada.estado === 'PAGADA'
                          ? 'success'
                          : 'secondary'
                  }
                >
                  {compraSeleccionada.estado}
                </CBadge>
              </div>

              <div className="border-top my-3" style={{ opacity: 0.2 }} />

              {/* PRODUCTOS */}
              <div className="text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: 1 }}>
                PRODUCTOS
              </div>

              {compraSeleccionada.productos.map((item, i) => (
                <div key={i} className="mb-3">
                  <div style={{ fontSize: '0.9rem' }}>
                    {i + 1}. {item.producto}
                  </div>

                  <div
                    className="d-flex justify-content-between text-muted"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <span>
                      {item.cantidad} x Bs {Number(item.costo_unitario).toFixed(2)}
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
                  Bs {Number(compraSeleccionada.total).toFixed(2)}
                </span>
              </div>

              {/* SALDO */}
              {Number(compraSeleccionada.saldo) > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="text-muted">Saldo pendiente</span>
                  <span className="text-warning fw-semibold">
                    Bs {Number(compraSeleccionada.saldo).toFixed(2)}
                  </span>
                </div>
              )}
            </>
          )}
        </CModalBody>

        <CModalFooter className="d-flex justify-content-between">
          <CButton color="light" onClick={() => setCompraSeleccionada(null)}>
            Cerrar
          </CButton>

          {compraSeleccionada && (
            <CButton color="primary" onClick={() => descargarPDFDirecto(compraSeleccionada)}>
              Descargar PDF
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Compras
