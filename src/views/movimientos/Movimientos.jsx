import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CBadge,
  CCardHeader,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import SmartTable from '../../components/SmartTable'
import { movimientosService } from '../../services/movimientos.service'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import { useAuthStore } from '../../store/auth.store'

const Movimientos = () => {
  const navigate = useNavigate()
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(false)

  const permisos = useAuthStore((state) => state.permisos)
  const puedeAnular = permisos?.some((p) => p.clave === 'MOVIMIENTOS' && p.puede_eliminar === 1)

  const sucursalActiva = useAuthStore((state) => state.sucursalActiva)
  const puedeOperar = !!sucursalActiva

  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [detalleMovimiento, setDetalleMovimiento] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  /* =========================
     CARGAR MOVIMIENTOS
  ========================= */
  const fetchMovimientos = async () => {
    try {
      setLoading(true)

      const res = await movimientosService.listar()

      setMovimientos(res.data.data)
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los movimientos', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovimientos()
  }, [])

  const handleAnularMovimiento = async (movimiento) => {
    const { value: motivo } = await Swal.fire({
      title: 'Anular movimiento',
      input: 'text',
      inputLabel: 'Motivo de anulación',
      inputPlaceholder: 'Ej: Registro incorrecto',
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
          await movimientosService.anular(movimiento.id, motivo)
          return true
        } catch (error) {
          console.log('error: ', error)
          Swal.showValidationMessage(error.response?.data?.message || 'Error al anular movimiento')
        }
      },
    })

    if (motivo) {
      await fetchMovimientos()
      //setMovimientoSeleccionado(null) // si tienes modal abierto

      Swal.fire({
        icon: 'success',
        title: 'Movimiento anulado correctamente',
      })
    }
  }

  const handleVerDetalle = async (row) => {
    try {
      setLoadingDetalle(true)

      const { data } = await movimientosService.obtener(row.id)

      setDetalleMovimiento(data)
      setMostrarDetalle(true)
    } catch (error) {
      console.error('Error al obtener detalle:', error)
    } finally {
      setLoadingDetalle(false)
    }
  }

  // const MovimientoCard = ({ row, index }) => {
  //   let estado = row.estado
  //   let colorEstado = 'secondary'

  //   switch (row.estado) {
  //     case 'ANULADO':
  //       estado = 'Anulado'
  //       colorEstado = 'danger'
  //       break
  //     case 'ACTIVO':
  //       estado = 'Activo'
  //       colorEstado = 'success'
  //       break
  //     default:
  //       estado = row.estado
  //   }

  //   // Color según tipo movimiento
  //   let colorTipo = 'secondary'
  //   switch (row.tipo_movimiento) {
  //     case 'ENTRADA_INICIAL':
  //       colorTipo = 'success'
  //       break
  //     case 'TRANSFERENCIA':
  //       colorTipo = 'info'
  //       break
  //     case 'MERMA':
  //       colorTipo = 'danger'
  //       break
  //     case 'AJUSTE':
  //       colorTipo = 'warning'
  //       break
  //     default:
  //       colorTipo = 'secondary'
  //   }

  //   return (
  //     <CCard
  //       className="mb-3"
  //       style={{
  //         backgroundColor: '#f8f9fb',
  //         borderRadius: '20px',
  //         border: '1px solid #dee0e0',
  //         boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
  //       }}
  //     >
  //       <CCardBody className="p-3">
  //         {/* Header */}
  //         <div className="d-flex justify-content-between align-items-center mb-2">
  //           <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
  //             #{index + 1} · {row.codigo}
  //           </span>
  //           <CBadge color={colorEstado}>{estado}</CBadge>
  //         </div>

  //         {/* Fecha + Tipo */}
  //         <div className="d-flex justify-content-between align-items-center mb-3">
  //           <span className="text-muted" style={{ fontSize: '0.8rem' }}>
  //             {new Date(row.created_at).toLocaleDateString('es-BO')}
  //           </span>

  //           <CBadge color={colorTipo}>{row.tipo_movimiento}</CBadge>
  //         </div>

  //         {row.total_items === 1 ? (
  //           <div className="d-flex justify-content-between mb-2">
  //             <span className="text-muted">Producto</span>
  //             <span style={{ textAlign: 'right' }}>
  //               {row.producto_unico}
  //               <br />
  //               <small className="text-muted">Cantidad: {row.cantidad_unica}</small>
  //             </span>
  //           </div>
  //         ) : (
  //           <div className="d-flex justify-content-between mb-2">
  //             <span className="text-muted">Productos</span>
  //             <span>
  //               {row.total_items} productos
  //               <br />
  //               <small className="text-muted">Total unidades: {row.total_cantidad}</small>
  //             </span>
  //           </div>
  //         )}

  //         {/* Sucursal */}
  //         <div className="d-flex justify-content-between mb-2">
  //           <span className="text-muted" style={{ fontSize: '0.85rem' }}>
  //             Sucursal
  //           </span>
  //           <span style={{ fontSize: '0.85rem', textAlign: 'right' }}>{row.label_sucursal}</span>
  //         </div>

  //         {/* Botones */}
  //         <div className="d-flex gap-2">
  //           {row.total_items > 1 && (
  //             <CButton size="sm" color="info" className="w-100" onClick={() => verDetalle(row.id)}>
  //               Ver detalle
  //             </CButton>
  //           )}

  //           {puedeOperar && puedeAnular && row.estado !== 'ANULADO' && (
  //             <CButton
  //               size="sm"
  //               color="danger"
  //               className="w-100"
  //               onClick={() => handleAnularMovimiento(row)}
  //             >
  //               Anular
  //             </CButton>
  //           )}
  //         </div>
  //       </CCardBody>
  //     </CCard>
  //   )
  // }

  const MovimientoCard = ({ row, index }) => {
    let estado = row.estado
    let colorEstado = 'secondary'

    switch (row.estado) {
      case 'ANULADO':
        estado = 'Anulado'
        colorEstado = 'danger'
        break
      case 'ACTIVO':
        estado = 'Activo'
        colorEstado = 'success'
        break
      default:
        estado = row.estado
    }

    let colorTipo = 'secondary'
    switch (row.tipo_movimiento) {
      case 'ENTRADA_INICIAL':
        colorTipo = 'success'
        break
      case 'TRANSFERENCIA':
        colorTipo = 'info'
        break
      case 'MERMA':
        colorTipo = 'danger'
        break
      case 'AJUSTE':
        colorTipo = 'warning'
        break
      default:
        colorTipo = 'secondary'
    }

    return (
      <CCard
        className="mb-3"
        style={{
          backgroundColor: '#ffffff', // 👈 FIX
          borderRadius: '20px',
          border: '1px solid #dee0e0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        }}
      >
        <CCardBody className="p-3" style={{ color: '#000' }}>
          {' '}
          {/* 👈 FIX GLOBAL */}
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
              #{index + 1} · {row.codigo}
            </span>
            <CBadge color={colorEstado}>{estado}</CBadge>
          </div>
          {/* Fecha + Tipo */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
              {new Date(row.created_at).toLocaleDateString('es-BO')}
            </span>

            <CBadge color={colorTipo}>{row.tipo_movimiento}</CBadge>
          </div>
          {row.total_items === 1 ? (
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: '#6c757d' }}>Producto</span>
              <span style={{ textAlign: 'right', color: '#000' }}>
                {row.producto_unico}
                <br />
                <small style={{ color: '#6c757d' }}>Cantidad: {row.cantidad_unica}</small>
              </span>
            </div>
          ) : (
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: '#6c757d' }}>Productos</span>
              <span style={{ color: '#000' }}>
                {row.total_items} productos
                <br />
                <small style={{ color: '#6c757d' }}>Total unidades: {row.total_cantidad}</small>
              </span>
            </div>
          )}
          {/* Sucursal */}
          <div className="d-flex justify-content-between mb-2">
            <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>Sucursal</span>
            <span style={{ fontSize: '0.85rem', textAlign: 'right', color: '#000' }}>
              {row.label_sucursal}
            </span>
          </div>
          {/* Botones */}
          <div className="d-flex gap-2">
            {row.total_items > 1 && (
              <CButton size="sm" color="info" className="w-100" onClick={() => verDetalle(row.id)}>
                Ver detalle
              </CButton>
            )}

            {puedeOperar && puedeAnular && row.estado !== 'ANULADO' && (
              <CButton
                size="sm"
                color="danger"
                className="w-100"
                onClick={() => handleAnularMovimiento(row)}
              >
                Anular
              </CButton>
            )}
          </div>
        </CCardBody>
      </CCard>
    )
  }

  /* =========================
     COLUMNAS SMART TABLE
  ========================= */
  const columns = [
    {
      key: 'codigo',
      label: 'Código',
    },
    {
      key: 'tipo_movimiento',
      label: 'Tipo',
    },
    {
      key: 'label_producto',
      label: 'Producto',

      render: (row) => {
        const totalItems = Number(row.total_items) || 0

        if (totalItems === 1 && row.producto_unico) {
          return <span className="fw-semibold">{row.producto_unico}</span>
        }

        return (
          <span>
            Total Ítems {totalItems}{' '}
            <span
              className="text-primary fw-semibold"
              style={{ cursor: 'pointer' }}
              onClick={() => handleVerDetalle(row)}
            >
              (ver)
            </span>
          </span>
        )
      },

      mobileTitle: (row, index) => {
        const totalItems = Number(row.total_items) || 0

        return `#${index + 1} - ${
          totalItems === 1 && row.producto_unico ? row.producto_unico : `Total Ítems ${totalItems}`
        }`
      },
    },
    {
      key: 'cantidad',
      label: 'Cant',
      render: (row) => {
        if (row.total_items === 1) {
          return row.cantidad_unica ?? row.total_cantidad
        }

        return row.total_cantidad
      },
    },
    {
      key: 'costo_unitario',
      label: 'Costo Unit.',
      render: (row) => {
        if (!row.costo_unitario_unico) return '-'
        return `Bs ${Number(row.costo_unitario_unico).toFixed(2)}`
      },
    },
    {
      key: 'label_sucursal',
      label: 'Sucursal Destino',
    },
    {
      key: 'created_at',
      label: 'Fecha',
      render: (row) => dayjs(row.created_at).format('DD/MM/YYYY HH:mm'),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) =>
        row.estado === 'ANULADO' ? (
          <CBadge color="danger">Anulado</CBadge>
        ) : (
          <CBadge color="success">Activo</CBadge>
        ),
    },
    {
      key: 'acciones',
      label: '',
      render: (row) => (
        <div className="d-flex gap-2">
          {puedeOperar && puedeAnular && row.estado !== 'ANULADO' && (
            <CButton size="sm" color="danger" onClick={() => handleAnularMovimiento(row)}>
              Anular
            </CButton>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Movimientos Stock</h4>

        <CButton color="primary" onClick={() => navigate('/movimientos/nuevo')}>
          Nuevo
        </CButton>
      </div>

      <CCard>
        <CCardBody>
          {loading ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center text-muted p-4">No existen movimientos registrados</div>
          ) : (
            <>
              {/* 📱 Mobile */}
              <div className="d-md-none">
                {movimientos.map((movimiento, index) => (
                  <MovimientoCard key={movimiento.id} row={movimiento} index={index} />
                ))}
              </div>

              {/* 🖥 Desktop */}
              <div className="d-none d-md-block">
                <SmartTable columns={columns} data={movimientos} pageSize={10} />
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={mostrarDetalle} onClose={() => setMostrarDetalle(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Detalle Movimiento</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loadingDetalle && <p>Cargando...</p>}

          {!loadingDetalle && detalleMovimiento && (
            <>
              <div className="mb-3">
                <strong>Código:</strong> {detalleMovimiento.movimiento.codigo}
                <br />
                <strong>Sucursal destino:</strong> {detalleMovimiento.movimiento.label_sucursal}
                <br />
                <strong>Creado por:</strong> {detalleMovimiento.movimiento.creado_por}
              </div>

              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Costo</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleMovimiento.detalles.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.label_producto}</td>
                      <td>{item.cantidad}</td>
                      <td>Bs {Number(item.costo_unitario).toFixed(2)}</td>
                      <td>Bs {Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setMostrarDetalle(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Movimientos
