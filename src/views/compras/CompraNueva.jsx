import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/auth.store'
import { useRef } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'
import {
  CCard,
  CCardBody,
  CButton,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CFormSwitch,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import Select from 'react-select'
import comprasService from '../../services/compras.service'
import { proveedoresService } from '../../services/proveedores.service'
import { productosService } from '../../services/productos.service'
import { categoriasService } from '../../services/categorias.service'
import { marcasService } from '../../services/marcas.service'

const CompraNueva = () => {
  const navigate = useNavigate()
  const { sucursalActiva } = useAuthStore()

  const fechaCompraRef = useRef(null)
  const fechaVencimientoRef = useRef(null)
  const hoy = new Date().toISOString().split('T')[0]
  /* ================= RESPONSIVE ================= */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* ================= CABECERA ================= */
  const [proveedor, setProveedor] = useState('')
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().slice(0, 10))
  const [errores, setErrores] = useState({})

  /* ================= PAGO ================= */
  const [tipoPago, setTipoPago] = useState('CONTADO')
  const [abonoInicial, setAbonoInicial] = useState(false)
  const [montoAbono, setMontoAbono] = useState('')
  const [observacion, setObservacion] = useState('')

  /* ================= DETALLE ================= */
  const [detalle, setDetalle] = useState([])
  const [cargando, setCargando] = useState(false)

  const [productoTmp, setProductoTmp] = useState({
    producto_id: '',
    nombre: '',
    cantidad: '',
    costo: '',
    precio_venta: '',
    unidad_medida: '',
    tipo_presentacion: '',
    fecha_vencimiento: '',
    usa_vencimiento: false,
  })

  const [mostrarModalProveedor, setMostrarModalProveedor] = useState(false)

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    nit: '',
    ci: '',
    telefono: '',
  })
  const [guardandoProveedor, setGuardandoProveedor] = useState(false)

  const [mostrarModalProducto, setMostrarModalProducto] = useState(false)

  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])

  const [nuevoProducto, setNuevoProducto] = useState({
    categoria_id: '',
    marca_id: '',
    nombre: '',
    descripcion: '',
    tipo_presentacion: 'UNIDAD',
    unidad_medida: '',
    precio_venta: '',
  })

  const [guardandoProducto, setGuardandoProducto] = useState(false)

  const [proveedores, setProveedores] = useState([])
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)
  const [productos, setProductos] = useState([])
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  const [erroresNumericos, setErroresNumericos] = useState({
    cantidad: false,
    costo: false,
    precio_venta: false,
    abono: false,
  })
  const normalizarDecimal = (valor) => {
    if (!valor) return ''
    let limpio = valor.replace(',', '.')
    limpio = limpio.replace(/[^0-9.]/g, '')
    const partes = limpio.split('.')
    if (partes.length > 2) {
      limpio = partes[0] + '.' + partes.slice(1).join('')
    }
    return limpio
  }

  const totalCompra = detalle.reduce((acc, item) => acc + item.subtotal, 0)

  const saldoCredito =
    tipoPago === 'CREDITO'
      ? abonoInicial
        ? totalCompra - Number(montoAbono || 0)
        : totalCompra
      : 0

  /* ================= CARGAS ================= */
  useEffect(() => {
    const cargarCategorias = async () => {
      const res = await categoriasService.listarActivas()
      setCategorias(res.data)
    }
    cargarCategorias()
  }, [])

  useEffect(() => {
    const cargarMarcas = async () => {
      const res = await marcasService.listar()
      setMarcas(res.data)
    }
    cargarMarcas()
  }, [])

  useEffect(() => {
    const cargarProveedores = async () => {
      const { data } = await proveedoresService.listar()
      setProveedores(
        data
          .filter((p) => p.estado === 1)
          .map((p) => ({
            value: p.id,
            label: `${p.nombre}${p.nit ? ' - ' + p.nit : ''}`,
          })),
      )
    }
    cargarProveedores()
  }, [])

  useEffect(() => {
    const cargarProductos = async () => {
      const { data } = await productosService.listar()
      setProductos(
        data
          .filter((p) => p.estado === 1)
          .map((p) => ({
            value: p.id,
            label: `${p.nombre}${p.descripcion ? ' ' + p.descripcion : ''}`,
            precio_venta: p.precio_venta,
            unidad_medida: p.unidad_medida,
            tipo_presentacion: p.tipo_presentacion,
          })),
      )
    }
    cargarProductos()
  }, [])

  /* ================= AGREGAR ================= */
  const agregarProducto = () => {
    if (!proveedor) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione proveedor antes de agregar productos',
      })
      return false
    }

    let nuevosErrores = {}
    if (!productoTmp.producto_id) nuevosErrores.producto_id = true
    if (!productoTmp.cantidad) nuevosErrores.cantidad = true
    if (!productoTmp.costo) nuevosErrores.costo = true
    if (!productoTmp.precio_venta) nuevosErrores.precio_venta = true

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      Swal.fire({
        icon: 'warning',
        title: 'Complete los campos marcados',
      })
      return false
    }

    const cantidad = Number(productoTmp.cantidad)
    const costo = Number(productoTmp.costo)
    const precioVenta = Number(productoTmp.precio_venta)

    if (cantidad <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'La cantidad debe ser mayor a 0',
      })
      return false
    }

    if (costo <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Costo inválido',
        text: 'El costo debe ser mayor a 0',
      })
      return false
    }

    if (precioVenta <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Precio inválido',
        text: 'El precio de venta debe ser mayor a 0',
      })
      return false
    }

    if (costo >= precioVenta) {
      Swal.fire({
        icon: 'error',
        title: 'El costo no puede ser mayor o igual al precio de venta',
      })
      return false
    }

    const existe = detalle.some((item) => item.producto_id === productoTmp.producto_id)

    if (existe) {
      Swal.fire({
        icon: 'info',
        title: 'Este producto ya fue agregado',
      })
      return false
    }

    setDetalle((prev) => [
      ...prev,
      {
        ...productoTmp,
        cantidad: Number(productoTmp.cantidad),
        costo,
        precio_venta: precioVenta,
        subtotal: Number((Number(productoTmp.cantidad) * costo).toFixed(2)),
      },
    ])

    setErrores({})
    setProductoSeleccionado(null)

    setProductoTmp({
      producto_id: '',
      nombre: '',
      cantidad: '',
      costo: '',
      precio_venta: '',
      unidad_medida: '',
      tipo_presentacion: '',
      fecha_vencimiento: '',
      usa_vencimiento: false,
    })

    return true
  }

  const eliminarProducto = (index) => {
    setDetalle((prev) => prev.filter((_, i) => i !== index))
  }

  const guardarCompra = async () => {
    if (!sucursalActiva) {
      return Swal.fire({
        icon: 'warning',
        title: 'Seleccione una sucursal',
      })
    }

    if (!proveedor) {
      return Swal.fire({ icon: 'warning', title: 'Seleccione proveedor' })
    }

    if (detalle.length === 0) {
      return Swal.fire({ icon: 'warning', title: 'Agregue productos' })
    }

    try {
      setCargando(true)

      await comprasService.crear({
        proveedor_id: proveedor,
        fecha: fechaCompra,
        tipo_pago: tipoPago,
        abono_inicial: tipoPago === 'CREDITO' && abonoInicial ? Number(montoAbono || 0) : 0,
        observacion,
        productos: detalle.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          costo_unitario: item.costo,
          precio_venta: item.precio_venta,
          fecha_vencimiento: item.usa_vencimiento ? item.fecha_vencimiento : null,
        })),
      })

      Swal.fire({
        icon: 'success',
        title: 'Compra registrada correctamente',
      }).then(() => navigate('/compras'))
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: error.response?.data?.message || 'Error al guardar',
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <div style={{ paddingBottom: isMobile ? 140 : 0 }}>
        <h4>Nueva compra</h4>

        {/* ================= CABECERA ================= */}
        {/* TU BLOQUE ORIGINAL SIN CAMBIOS */}
        <CCard className="mb-3">
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <label className="form-label">Proveedor</label>
                <div className="d-flex align-items-start gap-2">
                  <div style={{ flex: 1 }}>
                    <Select
                      value={proveedorSeleccionado}
                      options={proveedores}
                      isDisabled={detalle.length > 0}
                      onChange={(option) => {
                        setProveedorSeleccionado(option)
                        setProveedor(option ? option.value : '')
                      }}
                      placeholder="Buscar proveedor..."
                      isClearable
                    />
                  </div>

                  <CButton
                    size="sm"
                    color="success"
                    variant="outline"
                    style={{
                      height: 38,
                      minWidth: isMobile ? 38 : 90,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setMostrarModalProveedor(true)}
                  >
                    {isMobile ? '+' : '+ Nuevo'}
                  </CButton>
                </div>
              </CCol>

              <CCol md={6}>
                <CFormInput
                  label="Fecha compra"
                  type="date"
                  value={fechaCompra}
                  ref={fechaCompraRef}
                  onClick={() => fechaCompraRef.current?.showPicker()}
                  onChange={(e) => setFechaCompra(e.target.value)}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* ================= AGREGAR PRODUCTO ================= */}
        <CCard className="mb-3">
          {/* HEADER COLLAPSE SOLO EN MOVIL */}
          {isMobile && (
            <div
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              style={{
                background: '#e8f5e9', // verde claro
                padding: '14px 16px',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                cursor: 'pointer',
                borderBottom: mostrarFormulario ? '1px solid #ddd' : 'none',
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <strong style={{ color: '#2e7d32' }}>
                  {mostrarFormulario ? 'Ocultar formulario' : 'Agregar producto'}
                </strong>
                <span style={{ fontSize: 18, color: '#2e7d32' }}>
                  {mostrarFormulario ? '▲' : '▼'}
                </span>
              </div>
            </div>
          )}

          {/* FORMULARIO */}
          {(!isMobile || mostrarFormulario) && (
            <CCardBody>
              <CRow className="align-items-end">
                <CCol md={5}>
                  <label className="form-label">Producto</label>
                  <div className="d-flex align-items-start gap-2">
                    <div style={{ flex: 1 }}>
                      <Select
                        value={productoSeleccionado}
                        options={productos}
                        onChange={(option) => {
                          setProductoSeleccionado(option)
                          if (!option) return
                          setProductoTmp((prev) => ({
                            ...prev,
                            producto_id: option.value,
                            nombre: option.label,
                            precio_venta: option.precio_venta,
                            unidad_medida: option.unidad_medida,
                            tipo_presentacion: option.tipo_presentacion,
                          }))
                        }}
                        placeholder="Buscar producto..."
                        isClearable
                      />
                    </div>

                    <CButton
                      size="sm"
                      color="success"
                      variant="outline"
                      style={{
                        height: 38,
                        minWidth: isMobile ? 38 : 90,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={() => setMostrarModalProducto(true)}
                    >
                      {isMobile ? '+' : '+ Nuevo'}
                    </CButton>
                  </div>
                </CCol>

                <CCol md={1}>
                  <CFormInput
                    label="Cantidad"
                    type="number"
                    min="0"
                    step="1"
                    invalid={erroresNumericos.cantidad}
                    value={productoTmp.cantidad}
                    onChange={(e) => {
                      let value = e.target.value

                      if (Number(value) < 0) {
                        value = 0
                      }

                      setErroresNumericos((prev) => ({
                        ...prev,
                        cantidad: Number(value) <= 0,
                      }))

                      setProductoTmp({ ...productoTmp, cantidad: value })
                    }}
                  />
                </CCol>

                <CCol md={2}>
                  <CFormInput
                    label="Costo"
                    type="text"
                    value={productoTmp.costo}
                    invalid={erroresNumericos.costo}
                    onChange={(e) => {
                      let value = normalizarDecimal(e.target.value)

                      setProductoTmp({ ...productoTmp, costo: value })

                      setErroresNumericos((prev) => ({
                        ...prev,
                        costo: Number(value) <= 0,
                      }))
                    }}
                    onBlur={(e) => {
                      if (e.target.value) {
                        const formateado = Number(e.target.value).toFixed(2)
                        setProductoTmp({ ...productoTmp, costo: formateado })
                      }
                    }}
                  />
                </CCol>

                <CCol md={2}>
                  <CFormInput
                    label="Precio vta"
                    type="text"
                    value={productoTmp.precio_venta}
                    invalid={erroresNumericos.precio_venta}
                    onChange={(e) => {
                      let value = normalizarDecimal(e.target.value)

                      setProductoTmp({ ...productoTmp, precio_venta: value })

                      setErroresNumericos((prev) => ({
                        ...prev,
                        precio_venta: Number(value) <= 0,
                      }))
                    }}
                    onBlur={(e) => {
                      if (e.target.value) {
                        const formateado = Number(e.target.value).toFixed(2)
                        setProductoTmp({ ...productoTmp, precio_venta: formateado })
                      }
                    }}
                  />
                </CCol>

                <CCol md={2}>
                  <CButton
                    color="primary"
                    className="w-100"
                    onClick={() => {
                      const agregado = agregarProducto()

                      if (agregado && isMobile) {
                        setMostrarFormulario(false)

                        setTimeout(() => {
                          window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: 'smooth',
                          })
                        }, 250)
                      }
                    }}
                  >
                    Añadir producto
                  </CButton>
                </CCol>
              </CRow>

              <CFormSwitch
                label="Tiene fecha vencimiento"
                checked={productoTmp.usa_vencimiento}
                onChange={(e) =>
                  setProductoTmp({
                    ...productoTmp,
                    usa_vencimiento: e.target.checked,
                  })
                }
                className="mt-3"
              />

              {productoTmp.usa_vencimiento && (
                <CFormInput
                  label="Fecha vencimiento"
                  type="date"
                  value={productoTmp.fecha_vencimiento}
                  ref={fechaVencimientoRef}
                  min={hoy}
                  onClick={() => fechaVencimientoRef.current?.showPicker()}
                  onChange={(e) =>
                    setProductoTmp({
                      ...productoTmp,
                      fecha_vencimiento: e.target.value,
                    })
                  }
                />
              )}
            </CCardBody>
          )}
        </CCard>

        {/* ================= TABLA / CARDS ================= */}
        {detalle.length === 0 ? (
          <div
            style={{
              border: '1px dashed #ccc',
              padding: 20,
              borderRadius: 8,
              textAlign: 'center',
              color: '#888',
              background: '#fafafa',
            }}
          >
            <h6>Aún no ha agregado productos</h6>
            <small>Agregue productos para registrar la compra</small>
          </div>
        ) : isMobile ? (
          detalle.map((item, index) => (
            <CCard key={index} className="mb-3 shadow-sm">
              <CCardBody>
                <div className="d-flex justify-content-between">
                  <strong>
                    #{index + 1} - {item.nombre}
                  </strong>

                  {item.fecha_vencimiento && (
                    <div style={{ fontSize: 13, color: '#d32f2f', marginTop: 4 }}>
                      Vence: {item.fecha_vencimiento}
                    </div>
                  )}

                  <CButton
                    color="danger"
                    variant="outline"
                    size="sm"
                    style={{
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                    }}
                    onClick={() => eliminarProducto(index)}
                  >
                    ❌
                  </CButton>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Cantidad:</span>
                  <strong>{item.cantidad}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Costo:</span>
                  <strong>{item.costo}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>P. Venta:</span>
                  <strong>{item.precio_venta}</strong>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span>Subtotal:</span>
                  <strong>{item.subtotal.toFixed(2)}</strong>
                </div>
              </CCardBody>
            </CCard>
          ))
        ) : (
          <CTable bordered responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Producto</CTableHeaderCell>
                <CTableHeaderCell>Cant</CTableHeaderCell>
                <CTableHeaderCell>F Venc</CTableHeaderCell>
                <CTableHeaderCell>Costo</CTableHeaderCell>
                <CTableHeaderCell>P.Venta</CTableHeaderCell>
                <CTableHeaderCell>Subtotal</CTableHeaderCell>
                <CTableHeaderCell></CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {detalle.map((item, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{item.nombre}</CTableDataCell>
                  <CTableDataCell>{item.cantidad}</CTableDataCell>
                  <CTableDataCell>
                    {item.fecha_vencimiento ? item.fecha_vencimiento : '-'}
                  </CTableDataCell>
                  <CTableDataCell>{item.costo}</CTableDataCell>
                  <CTableDataCell>{item.precio_venta}</CTableDataCell>
                  <CTableDataCell>{item.subtotal.toFixed(2)}</CTableDataCell>
                  <CTableDataCell>
                    <CButton size="sm" color="danger" onClick={() => eliminarProducto(index)}>
                      ❌
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}

        {/* ================= FORMA DE PAGO ================= */}
        <CCard className="mt-4">
          <CCardBody>
            <CRow className="align-items-center">
              <CCol md={3}>
                <CFormSelect
                  label="Forma de pago"
                  value={tipoPago}
                  onChange={(e) => setTipoPago(e.target.value)}
                >
                  <option value="CONTADO">Contado</option>
                  <option value="CREDITO">Crédito</option>
                </CFormSelect>
              </CCol>

              {tipoPago === 'CREDITO' && (
                <CCol md={2} className="mt-3">
                  <CFormSwitch
                    label="Abono inicial"
                    checked={abonoInicial}
                    onChange={(e) => {
                      const activo = e.target.checked
                      setAbonoInicial(activo)
                      if (!activo) setMontoAbono('')
                    }}
                  />
                </CCol>
              )}

              {tipoPago === 'CREDITO' && abonoInicial && (
                <CCol md={3}>
                  <CFormInput
                    label="Monto abono"
                    type="text"
                    value={montoAbono}
                    invalid={erroresNumericos.abono}
                    onChange={(e) => {
                      let value = normalizarDecimal(e.target.value)

                      setMontoAbono(value)

                      setErroresNumericos((prev) => ({
                        ...prev,
                        abono: Number(value) < 0,
                      }))
                    }}
                    onBlur={(e) => {
                      if (e.target.value) {
                        const formateado = Number(e.target.value).toFixed(2)
                        setMontoAbono(formateado)
                      }
                    }}
                  />
                </CCol>
              )}
            </CRow>

            <div className="text-end mt-4">
              {!isMobile && (
                <>
                  <h5>Total: Bs {totalCompra.toFixed(2)}</h5>
                  {tipoPago === 'CREDITO' && <h6>Saldo: Bs {saldoCredito.toFixed(2)}</h6>}
                </>
              )}

              {!isMobile && (
                <CButton color="success" size="lg" onClick={guardarCompra}>
                  Guardar compra
                </CButton>
              )}
            </div>
          </CCardBody>
        </CCard>
      </div>

      {isMobile && detalle.length > 0 && (
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
            <strong>Bs {totalCompra.toFixed(2)}</strong>
          </div>

          {tipoPago === 'CREDITO' && (
            <div className="d-flex justify-content-between">
              <span>Saldo:</span>
              <strong>Bs {saldoCredito.toFixed(2)}</strong>
            </div>
          )}

          <CButton
            color="success"
            size="lg"
            className="w-100 mt-2"
            onClick={guardarCompra}
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : 'Guardar compra'}
          </CButton>
        </div>
      )}

      {/* ================= MODAL PROVEEDOR RÁPIDO ================= */}
      <CModal visible={mostrarModalProveedor} onClose={() => setMostrarModalProveedor(false)}>
        <CModalHeader>
          <CModalTitle>Nuevo proveedor</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormInput
            label="Nombre *"
            value={nuevoProveedor.nombre}
            onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })}
          />

          <CFormInput
            label="NIT"
            className="mt-3"
            value={nuevoProveedor.nit}
            onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nit: e.target.value })}
          />

          <CFormInput
            label="CI"
            className="mt-3"
            value={nuevoProveedor.ci}
            onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, ci: e.target.value })}
          />

          <CFormInput
            label="Teléfono *"
            className="mt-3"
            value={nuevoProveedor.telefono}
            onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })}
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setMostrarModalProveedor(false)}>
            Cancelar
          </CButton>

          <CButton
            color="success"
            disabled={guardandoProveedor}
            onClick={async () => {
              if (!nuevoProveedor.nombre.trim()) {
                return Swal.fire({
                  icon: 'warning',
                  title: 'Nombre requerido',
                })
              }

              try {
                setGuardandoProveedor(true)
                const response = await proveedoresService.crear(nuevoProveedor)
                const proveedorCreado = response.data.proveedor

                const nuevo = {
                  value: proveedorCreado.id,
                  label: `${proveedorCreado.nombre}${proveedorCreado.nit ? ' - ' + proveedorCreado.nit : ''}`,
                }

                setProveedores((prev) => [...prev, nuevo])
                setProveedorSeleccionado(nuevo)
                setProveedor(proveedorCreado.id)

                // reset
                setNuevoProveedor({
                  nombre: '',
                  nit: '',
                  ci: '',
                  telefono: '',
                })

                setMostrarModalProveedor(false)

                Swal.fire({
                  icon: 'success',
                  title: 'Proveedor creado',
                  timer: 1000,
                  showConfirmButton: false,
                })
              } catch (error) {
                Swal.fire({
                  icon: 'error',
                  title: 'No se pudo crear proveedor',
                })
              } finally {
                setGuardandoProveedor(false)
              }
            }}
          >
            {guardandoProveedor ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ================= MODAL PRODUCTO RÁPIDO ================= */}
      <CModal
        visible={mostrarModalProducto}
        onClose={() => setMostrarModalProducto(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Nuevo producto</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CRow>
            <CCol md={6}>
              <CFormSelect
                label="Categoría *"
                value={nuevoProducto.categoria_id}
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, categoria_id: e.target.value })
                }
              >
                <option value="">Seleccione</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={6}>
              <CFormSelect
                label="Marca"
                value={nuevoProducto.marca_id}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, marca_id: e.target.value })}
              >
                <option value="">Seleccione</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          <CFormInput
            label="Nombre *"
            className="mt-3"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
          />

          <CFormInput
            label="Descripción"
            className="mt-3"
            value={nuevoProducto.descripcion}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
          />

          <CRow className="mt-3">
            <CCol md={6}>
              <CFormSelect
                label="Presentación"
                value={nuevoProducto.tipo_presentacion}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    tipo_presentacion: e.target.value,
                  })
                }
              >
                <option value="UNIDAD">UNIDAD</option>
                <option value="CAJA">CAJA</option>
                <option value="GRANEL">GRANEL</option>
              </CFormSelect>
            </CCol>

            <CCol md={6}>
              <CFormSelect
                label="Unidad medida"
                value={nuevoProducto.unidad_medida}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    unidad_medida: e.target.value,
                  })
                }
              >
                {/* <option value="">Seleccione</option> */}
                <option value="PZA">PZA - Pieza</option>
                <option value="KG">KG - Kilogramo</option>
                <option value="LT">LT - Litro</option>
                <option value="GR">GR - Gramo</option>
              </CFormSelect>
            </CCol>
          </CRow>

          <CFormInput
            label="Precio venta *"
            type="number"
            className="mt-3"
            value={nuevoProducto.precio_venta}
            onChange={(e) =>
              setNuevoProducto({
                ...nuevoProducto,
                precio_venta: e.target.value,
              })
            }
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setMostrarModalProducto(false)}>
            Cancelar
          </CButton>

          <CButton
            color="success"
            disabled={guardandoProducto}
            onClick={async () => {
              if (
                !nuevoProducto.categoria_id ||
                !nuevoProducto.nombre.trim() ||
                !nuevoProducto.precio_venta
              ) {
                return Swal.fire({
                  icon: 'warning',
                  title: 'Complete los campos obligatorios',
                })
              }

              try {
                setGuardandoProducto(true)

                //const { data } = await productosService.crear(nuevoProducto)
                const response = await productosService.crear(nuevoProducto)
                const productoCreado = response.data.producto

                const nuevo = {
                  value: productoCreado.id,
                  label: `${productoCreado.nombre}${productoCreado.descripcion ? ' ' + productoCreado.descripcion : ''}`,
                  precio_venta: productoCreado.precio_venta,
                  unidad_medida: productoCreado.unidad_medida,
                  tipo_presentacion: productoCreado.tipo_presentacion,
                }

                setProductos((prev) => [...prev, nuevo])
                setProductoSeleccionado(nuevo)

                setProductoTmp((prev) => ({
                  ...prev,
                  producto_id: nuevo.value,
                  nombre: nuevo.label,
                  precio_venta: nuevo.precio_venta,
                  unidad_medida: nuevo.unidad_medida,
                  tipo_presentacion: nuevo.tipo_presentacion,
                }))
                setMostrarModalProducto(false)

                setNuevoProducto({
                  categoria_id: '',
                  marca_id: '',
                  nombre: '',
                  descripcion: '',
                  tipo_presentacion: 'UNIDAD',
                  unidad_medida: '',
                  precio_venta: '',
                })

                Swal.fire({
                  icon: 'success',
                  title: 'Producto creado',
                  timer: 1000,
                  showConfirmButton: false,
                })
              } catch (error) {
                Swal.fire({
                  icon: 'error',
                  title: 'No se pudo crear producto',
                })
              } finally {
                setGuardandoProducto(false)
              }
            }}
          >
            {guardandoProducto ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CompraNueva
