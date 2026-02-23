import React, { useEffect, useMemo, useState } from 'react'
import { CRow, CCol, CCard, CCardBody, CButton, CFormInput, CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import Swal from 'sweetalert2'
import Select from 'react-select'

import { productosService } from '../../services/productos.service'
import ventasService from '../../services/ventas.service'
import { clientesService } from '../../services/clientes.service'

const POSPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [productos, setProductos] = useState([])
  const [clientes, setClientes] = useState([])
  const [carrito, setCarrito] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [tipoPago, setTipoPago] = useState('EFECTIVO')
  const [montoRecibido, setMontoRecibido] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarProductos()
    cargarClientes()
  }, [])

  const cargarProductos = async () => {
    const res = await productosService.listarPOS()
    setProductos(res.data || [])
  }

  const cargarClientes = async () => {
    const res = await clientesService.listar()
    const data = res.data || []

    setClientes(data)

    const clienteDefault = data.find((c) => c.nombre === 'SIN NOMBRE') || data[0]

    if (clienteDefault) {
      setClienteId(clienteDefault.id)
    }
  }
  const construirLabel = (p) => {
    return [p.marca, p.nombre, p.descripcion].filter(Boolean).join(' - ')
  }

  /* ======================
     FILTRO PRODUCTOS
  ====================== */

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) =>
      `${p.codigo} ${p.nombre} ${p.marca}`.toLowerCase().includes(busqueda.toLowerCase()),
    )
  }, [busqueda, productos])

  const cantidadEnCarrito = (id) => {
    const item = carrito.find((p) => p.producto_id === id)
    return item ? item.cantidad : 0
  }

  /* ======================
     AGREGAR PRODUCTO
  ====================== */

  const agregarProducto = (producto) => {
    const existe = carrito.find((p) => p.producto_id === producto.id)

    if (existe) {
      if (existe.cantidad + 1 > producto.stock) {
        Swal.fire('Stock insuficiente')
        return
      }

      setCarrito(
        carrito.map((p) =>
          p.producto_id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p,
        ),
      )
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          marca: producto.marca,
          descripcion: producto.descripcion,
          cantidad: 1,
          precio_original: Number(producto.precio_venta),
          precio_venta: Number(producto.precio_venta),
          stock: producto.stock,
        },
      ])
    }
  }

  const cambiarCantidad = (id, nueva) => {
    setCarrito((prev) =>
      prev.map((p) => {
        if (p.producto_id !== id) return p
        if (nueva <= 0) return p
        if (nueva > p.stock) {
          Swal.fire('Stock insuficiente')
          return p
        }
        return { ...p, cantidad: nueva }
      }),
    )
  }

  const cambiarPrecio = (id, nuevo) => {
    setCarrito((prev) =>
      prev.map((p) => (p.producto_id === id ? { ...p, precio_venta: Number(nuevo) } : p)),
    )
  }

  const eliminar = (id) => {
    setCarrito((prev) => prev.filter((p) => p.producto_id !== id))
  }

  /* ======================
     TOTALES
  ====================== */

  const total = carrito.reduce((acc, p) => acc + p.cantidad * p.precio_venta, 0)

  const montoNum = parseFloat(montoRecibido)
  const vuelto = tipoPago === 'EFECTIVO' && !isNaN(montoNum) ? montoNum - total : 0

  /* ======================
     COBRAR
  ====================== */

  const obtenerClienteDefault = () => {
    return clientes.find((c) => c.nombre === 'SIN NOMBRE') || clientes[0]
  }

  const cobrar = async () => {
    if (loading) return

    setLoading(true)

    if (carrito.length === 0) {
      Swal.fire('No hay productos')
      setLoading(false)
      return
    }

    if (tipoPago === 'EFECTIVO' && vuelto < 0) {
      Swal.fire('Monto insuficiente')
      setLoading(false)
      return
    }

    try {
      const payload = {
        cliente_id: clienteId || null,
        tipo_pago: tipoPago,
        productos: carrito.map((p) => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad,
          precio_venta: p.precio_venta,
        })),
      }

      const res = await ventasService(payload)

      Swal.fire('Venta registrada', res.codigo, 'success')

      setCarrito([])
      setMontoRecibido('')

      setTipoPago('EFECTIVO')

      const clienteDefault = obtenerClienteDefault()
      if (clienteDefault) {
        setClienteId(clienteDefault.id)
      }

      await cargarProductos()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const abrirCantidadManual = async (producto) => {
    const { value } = await Swal.fire({
      title: `Cantidad para ${producto.nombre}`,
      input: 'number',
      inputValue: producto.cantidad,
      inputAttributes: {
        min: 1,
        step: 1,
      },
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      didOpen: () => {
        const input = Swal.getInput()
        input.focus()
        input.select()
      },
      preConfirm: (value) => {
        const cantidad = Number(value)

        if (!cantidad || cantidad <= 0) {
          Swal.showValidationMessage('Cantidad inválida')
          return false
        }

        if (cantidad > producto.stock) {
          Swal.showValidationMessage('Stock insuficiente')
          return false
        }

        return cantidad
      },
    })

    if (value) {
      cambiarCantidad(producto.producto_id, value)
    }
  }

  const abrirPrecioManual = async (producto) => {
    const { value } = await Swal.fire({
      title: `Nuevo precio`,
      text: producto.nombre,
      input: 'number',
      inputValue: producto.precio_venta,
      inputAttributes: {
        min: 0.01,
        step: 0.01,
      },
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      didOpen: () => {
        const input = Swal.getInput()
        input.focus()
        input.select()
      },
      preConfirm: (value) => {
        const precio = Number(value)

        if (!precio || precio <= 0) {
          Swal.showValidationMessage('Precio inválido')
          return false
        }

        return precio
      },
    })

    if (value) {
      cambiarPrecio(producto.producto_id, value)
    }
  }

  /* ======================
     RENDER
  ====================== */

  return (
    <CRow>
      {/* IZQUIERDA */}
      <CCol md={7}>
        <CCard className="mb-3">
          <CCardBody>
            {isMobile ? (
              <div className="mb-3">
                <label className="form-label fw-semibold">Buscar producto</label>

                <Select
                  options={productos.map((p) => ({
                    value: p.id,
                    label: `${p.marca ? p.marca + ' - ' : ''}${p.nombre}${p.descripcion ? ' - ' + p.descripcion : ''} | Bs ${p.precio_venta}`,
                  }))}
                  placeholder="Escribe para buscar..."
                  onChange={(selected) => {
                    const producto = productos.find((p) => p.id === selected.value)
                    if (producto) agregarProducto(producto)
                  }}
                  isSearchable
                />
              </div>
            ) : (
              <div className="position-relative mb-3">
                <CIcon
                  icon={cilSearch}
                  size="lg"
                  className="position-absolute"
                  style={{
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%)',
                    color: '#999',
                  }}
                />
                <CFormInput
                  placeholder="Buscar producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            )}

            {!isMobile && (
              <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <CRow>
                  {productosFiltrados.map((p) => (
                    <CCol md={4} key={p.id} className="mb-3">
                      <CCard
                        className="h-100 shadow-sm border-0"
                        style={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                        }}
                        onClick={() => agregarProducto(p)}
                      >
                        {cantidadEnCarrito(p.id) > 0 && (
                          <span
                            className="badge bg-success position-absolute"
                            style={{ top: '10px', right: '10px' }}
                          >
                            {cantidadEnCarrito(p.id)}
                          </span>
                        )}

                        <CCardBody className="p-0 bg-transparent">
                          <div
                            style={{
                              backgroundColor: '#ffe5b5', // verde suave medio
                              padding: '12px',
                              minHeight: '60px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                              }}
                            >
                              {construirLabel(p)}
                            </div>
                          </div>

                          <div
                            style={{
                              backgroundColor: '#faeee2', // verde mucho más claro
                              padding: '10px 12px',
                            }}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <span className="small text-muted">Stock: {p.stock}</span>

                            <span
                              style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                color: '#198754',
                              }}
                            >
                              Bs {Number(p.precio_venta).toFixed(2)}
                            </span>
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* DERECHA */}
      <CCol md={5}>
        <div style={{ paddingBottom: isMobile ? '90px' : '0px' }}>
          <CCard className="border-0 shadow-sm" style={{ borderRadius: '14px' }}>
            {/* HEADER */}
            <div
              style={{
                backgroundColor: '#b4b4b9',
                padding: '12px 16px',
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '14px',
                borderTopRightRadius: '14px',
              }}
            >
              <span>🧾 Nueva venta</span>

              <span
                style={{
                  backgroundColor: '#218b3b',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                }}
              >
                {carrito.length} items
              </span>
            </div>

            <CCardBody>
              {/* CLIENTE */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Cliente</label>
                <CFormSelect value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </div>

              {/* LISTA PRODUCTOS */}
              <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                {carrito.length === 0 ? (
                  <div
                    style={{
                      padding: '40px 10px',
                      textAlign: 'center',
                      color: '#6c757d',
                    }}
                  >
                    <div style={{ fontSize: '2rem' }}>🛒</div>
                    <div className="mt-2 fw-semibold">Sin productos</div>
                    <div className="small">Agrega productos para iniciar la venta</div>
                  </div>
                ) : (
                  carrito.map((p, index) => (
                    <CCard
                      key={p.producto_id}
                      className="mb-3 border-0 shadow-sm"
                      style={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(111, 66, 193, 0.06)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <CCardBody>
                        {/* 1️⃣ LABEL */}
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            lineHeight: '1.2rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                          }}
                        >
                          <span
                            style={{
                              color: '#6c757d',
                              marginRight: '6px',
                            }}
                          >
                            #{index + 1}
                          </span>
                          {construirLabel(p)}
                        </div>

                        {/* 2️⃣ PRECIO + CANTIDAD */}
                        <div className="mt-3">
                          <div className="d-flex justify-content-between">
                            {/* PRECIO */}
                            <div>
                              <div className="small text-muted mb-1">Precio</div>
                              <div
                                style={{
                                  fontSize: '1.05rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  color: '#111',
                                }}
                                onClick={() => !loading && abrirPrecioManual(p)}
                                //onClick={() => abrirPrecioManual(p)}
                              >
                                Bs {Number(p.precio_venta).toFixed(2)}
                              </div>
                            </div>

                            {/* CANTIDAD */}
                            <div style={{ textAlign: 'center' }}>
                              <div className="small text-muted mb-1">Cant.</div>

                              <div className="d-flex align-items-center gap-2">
                                <CButton
                                  size="sm"
                                  color="danger"
                                  onClick={() =>
                                    !loading && cambiarCantidad(p.producto_id, p.cantidad - 1)
                                  }
                                  //onClick={() => cambiarCantidad(p.producto_id, p.cantidad - 1)}
                                >
                                  -
                                </CButton>

                                <span
                                  style={{
                                    minWidth: '30px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => abrirCantidadManual(p)}
                                >
                                  {p.cantidad}
                                </span>

                                <CButton
                                  size="sm"
                                  color="success"
                                  onClick={() => cambiarCantidad(p.producto_id, p.cantidad + 1)}
                                >
                                  +
                                </CButton>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3️⃣ SUBTOTAL + QUITAR */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="fw-semibold">
                            Subtotal: Bs {(p.cantidad * p.precio_venta).toFixed(2)}
                          </div>

                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => eliminar(p.producto_id)}
                          >
                            Quitar
                          </CButton>
                        </div>
                      </CCardBody>
                    </CCard>
                  ))
                )}
              </div>

              <hr />

              {/* TOTAL */}
              {!isMobile && <h5>Total: Bs {total.toFixed(2)}</h5>}
              {/* <h5>Total: Bs {total.toFixed(2)}</h5> */}

              {/* TIPO PAGO */}
              <CFormSelect
                className="mt-2"
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value)}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CREDITO">Crédito</option>
              </CFormSelect>

              {tipoPago === 'EFECTIVO' && (
                <>
                  <CFormInput
                    className="mt-2"
                    placeholder="Monto recibido"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                  />
                  <div className="mt-2 fw-bold">Vuelto: Bs {vuelto.toFixed(2)}</div>
                </>
              )}

              {/* BOTÓN DESKTOP */}
              {!isMobile && (
                <CButton
                  color="success"
                  className="w-100 mt-3"
                  onClick={cobrar}
                  disabled={loading || carrito.length === 0}
                >
                  {loading ? 'Procesando...' : 'Finalizar Venta'}
                </CButton>
              )}
            </CCardBody>
          </CCard>
        </div>

        {/* BOTÓN FIJO MOBILE */}
        {isMobile && (
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#fff',
              padding: 12,
              borderTop: '1px solid #ddd',
              zIndex: 1000,
              boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <div className="d-flex justify-content-between">
              <strong>Total:</strong>
              <strong>Bs {total.toFixed(2)}</strong>
            </div>

            <CButton
              color={carrito.length === 0 ? 'secondary' : 'primary'}
              size="lg"
              className="w-100 fw-semibold"
              style={{
                borderRadius: '12px',
                height: '48px',
              }}
              onClick={cobrar}
              disabled={carrito.length === 0 || loading}
            >
              {loading ? 'Procesando...' : `Finalizar Venta`}
            </CButton>
          </div>
        )}

        {/* {isMobile && (
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              backgroundColor: 'var(--cui-body-bg)',
              padding: '12px 16px',
              boxShadow: '0 -6px 16px rgba(0,0,0,0.12)',
              zIndex: 1050,
            }}
          >
            <CButton
              color={carrito.length === 0 ? 'secondary' : 'primary'}
              size="lg"
              className="w-100 fw-semibold"
              style={{
                borderRadius: '12px',
                height: '48px',
              }}
              onClick={cobrar}
              disabled={carrito.length === 0 || loading}
            >
              {loading ? 'Procesando...' : `Finalizar Venta • Bs ${total.toFixed(2)}`}
            </CButton>
          </div>
        )} */}
      </CCol>
    </CRow>
  )
}

export default POSPage
