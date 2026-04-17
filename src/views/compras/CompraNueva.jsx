import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/auth.store'
import { useRef } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCollapse,
} from '@coreui/react'
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
  CContainer,
} from '@coreui/react'
import Select from 'react-select'
import { format } from 'date-fns'
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

  const [fechaCompra, setFechaCompra] = useState(() => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // Los meses van de 0 a 11
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  //const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().slice(0, 10))
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
      const res = await productosService.listar()

      const lista = Array.isArray(res.data) ? res.data : res.data?.data || []

      setProductos(
        lista
          .filter((p) => p.estado === 1)
          .map((p) => ({
            value: p.id,
            label: `${p.marca ? p.marca + ' ' : ''}${p.nombre}${p.descripcion ? ' ' + p.descripcion : ''}`,
            precio_venta: Number(p.precio_venta),
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
            <CRow className="mb-3 mb-md-0">
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
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: 38,
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          borderColor: '#d8dbe0',
                          boxShadow: 'none',
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: '#000000',
                        }),
                        input: (base) => ({
                          ...base,
                          color: '#000000',
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#666666',
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: '#ffffff',
                        }),
                        menuList: (base) => ({
                          ...base,
                          backgroundColor: '#ffffff',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? '#f2f2f2' : '#ffffff',
                          color: '#000000',
                          cursor: 'pointer',
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
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

            <CRow>
              <div className="d-md-none">
                <CButton
                  onClick={() => setMostrarFormulario(!mostrarFormulario)}
                  className="w-100 mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: 'rgba(25, 135, 84, 0.12)', // verde suave
                    border: '1px solid rgba(25, 135, 84, 0.35)',
                    color: '#198754',
                    fontWeight: 600,
                    borderRadius: '12px',
                    padding: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
                    {mostrarFormulario ? '−' : '+'}
                  </span>

                  {mostrarFormulario ? 'Ocultar formulario' : 'Añadir producto'}
                </CButton>
                <CCollapse visible={mostrarFormulario}>
                  <CCard
                    className="mb-3 shadow-sm border-0"
                    style={{
                      borderRadius: '18px',
                      backgroundColor: '#f8f9ff',
                    }}
                  >
                    <CCardBody className="modern-input modern-label">
                      <CRow className="g-3">
                        <CCol xs={12}>
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

                        <CCol xs={12}>
                          <CFormInput
                            label="Cantidad"
                            type="number"
                            min="0"
                            step="1"
                            invalid={erroresNumericos.cantidad}
                            value={productoTmp.cantidad}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              caretColor: '#000000',
                            }}
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

                        <CCol xs={12}>
                          <CFormInput
                            label="Costo"
                            type="text"
                            value={productoTmp.costo}
                            invalid={erroresNumericos.costo}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              caretColor: '#000000',
                            }}
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

                        <CCol xs={12}>
                          <CFormInput
                            label="Precio vta"
                            type="text"
                            value={productoTmp.precio_venta}
                            invalid={erroresNumericos.precio_venta}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              caretColor: '#000000',
                            }}
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
                          <CCol xs={12}>
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
                          </CCol>
                        </CCol>
                        <CCol xs={12}>
                          <CButton
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
                            className="w-100 fw-semibold"
                            style={{
                              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                              border: 'none',
                              borderRadius: '14px',
                              padding: '12px',
                              fontSize: '0.95rem',
                              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            + Añadir producto
                          </CButton>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCollapse>
              </div>
            </CRow>
          </CCardBody>
        </CCard>

        <div className="d-none d-md-block">
          <CCard className="mb-3">
            <CCardBody>
              <CRow className="align-items-end">
                <CCol md={5}>
                  <label className="form-label fw-semibold">Producto</label>
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
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#000000',
                    }}
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
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#000000',
                    }}
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
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#000000',
                    }}
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

                {/* <CCol md={1}>
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
                </CCol> */}

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

              <CRow className="align-items-center mt-4">
                <CCol md="auto">
                  <CFormSwitch
                    label="Fecha de vencimiento"
                    checked={productoTmp.usa_vencimiento}
                    onChange={(e) =>
                      setProductoTmp({
                        ...productoTmp,
                        usa_vencimiento: e.target.checked,
                      })
                    }
                    className="fw-semibold"
                  />
                </CCol>

                {productoTmp.usa_vencimiento && (
                  <CCol md={2}>
                    <CFormInput
                      type="date"
                      //size="sm"
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
                  </CCol>
                )}
              </CRow>
            </CCardBody>
          </CCard>
        </div>

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
            <CCard
              key={index}
              className="mb-3 border-0 shadow-sm"
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                backgroundColor: '#ffffff', // 👈 FIX
                transition: 'all 0.15s ease',
              }}
            >
              <CCardBody style={{ color: '#000' }}>
                {' '}
                {/* 👈 FIX GLOBAL */}
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
                  {item.nombre}
                </div>
                {/* 2️⃣ COSTO + CANTIDAD */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between">
                    {/* COSTO */}
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Costo</div>

                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: '#000', // 👈 FIX
                        }}
                      >
                        Bs {Number(item.costo).toFixed(2)}
                      </div>
                    </div>

                    {/* CANTIDAD */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Cant.</div>

                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: '#000', // 👈 FIX
                        }}
                      >
                        {item.cantidad}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 3️⃣ PRECIO VENTA + VENCIMIENTO */}
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#6c757d' }}>
                  Venta: {item.precio_venta ? `Bs ${Number(item.precio_venta).toFixed(2)}` : '-'}
                  <br />
                  Vence:{' '}
                  {item.fecha_vencimiento
                    ? format(new Date(item.fecha_vencimiento), 'dd/MM/yyyy')
                    : '-'}
                </div>
                {/* 4️⃣ TOTAL + ELIMINAR */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="fw-semibold" style={{ color: '#000' }}>
                    Subtotal: Bs {item.subtotal.toFixed(2)}
                  </div>

                  <CButton
                    color="danger"
                    variant="outline"
                    size="sm"
                    onClick={() => eliminarProducto(index)}
                  >
                    Quitar
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
            // <CCard
            //   key={index}
            //   className="mb-3 border-0 shadow-sm"
            //   style={{
            //     borderRadius: '14px',
            //     overflow: 'hidden',
            //     backgroundColor: '#f2f8f4',
            //     transition: 'all 0.15s ease',
            //   }}
            // >
            //   <CCardBody>
            //     {/* 1️⃣ LABEL */}
            //     <div
            //       style={{
            //         fontWeight: 600,
            //         fontSize: '0.95rem',
            //         lineHeight: '1.2rem',
            //         display: '-webkit-box',
            //         WebkitLineClamp: 2,
            //         WebkitBoxOrient: 'vertical',
            //         overflow: 'hidden',
            //         wordBreak: 'break-word',
            //       }}
            //     >
            //       <span
            //         style={{
            //           color: '#6c757d',
            //           marginRight: '6px',
            //         }}
            //       >
            //         #{index + 1}
            //       </span>
            //       {item.nombre}
            //     </div>

            //     {/* 2️⃣ COSTO + CANTIDAD */}
            //     <div className="mt-3">
            //       <div className="d-flex justify-content-between">
            //         {/* COSTO */}
            //         <div>
            //           <div className="small text-muted mb-1">Costo</div>
            //           <div
            //             style={{
            //               fontSize: '1.05rem',
            //               fontWeight: 700,
            //               color: '#111',
            //             }}
            //           >
            //             Bs {Number(item.costo).toFixed(2)}
            //           </div>
            //         </div>

            //         {/* CANTIDAD */}
            //         <div style={{ textAlign: 'center' }}>
            //           <div className="small text-muted mb-1">Cant.</div>
            //           <div
            //             style={{
            //               fontWeight: 600,
            //               fontSize: '1rem',
            //             }}
            //           >
            //             {item.cantidad}
            //           </div>
            //         </div>
            //       </div>
            //     </div>

            //     {/* 3️⃣ PRECIO VENTA + VENCIMIENTO */}
            //     <div className="mt-3 small text-muted">
            //       Venta: {item.precio_venta ? `Bs ${Number(item.precio_venta).toFixed(2)}` : '-'}
            //       <br />
            //       Vence:{' '}
            //       {item.fecha_vencimiento
            //         ? format(new Date(item.fecha_vencimiento), 'dd/MM/yyyy')
            //         : '-'}
            //     </div>

            //     {/* 4️⃣ TOTAL + ELIMINAR */}
            //     <div className="d-flex justify-content-between align-items-center mt-3">
            //       <div className="fw-semibold">Subtotal: Bs {item.subtotal.toFixed(2)}</div>

            //       <CButton
            //         color="danger"
            //         variant="outline"
            //         size="sm"
            //         onClick={() => eliminarProducto(index)}
            //       >
            //         Quitar
            //       </CButton>
            //     </div>
            //   </CCardBody>
            // </CCard>
          ))
        ) : (
          <CTable
            hover
            responsive
            className="align-middle"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <CTableHead
              style={{
                backgroundColor: '#eef1f6',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontWeight: 600,
                color: '#495057',
              }}
            >
              <CTableRow>
                <CTableHeaderCell className="text-start">Producto</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Cant</CTableHeaderCell>
                <CTableHeaderCell className="text-center">F. Venc</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Costo</CTableHeaderCell>
                <CTableHeaderCell className="text-end">P. Venta</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                <CTableHeaderCell className="text-center"></CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {detalle.map((item, index) => (
                <CTableRow key={index} style={{ fontSize: '0.9rem' }}>
                  <CTableDataCell className="text-start fw-semibold">{item.nombre}</CTableDataCell>

                  <CTableDataCell className="text-center">{item.cantidad}</CTableDataCell>

                  <CTableDataCell className="text-center text-muted">
                    {item.fecha_vencimiento ? item.fecha_vencimiento : '-'}
                  </CTableDataCell>

                  <CTableDataCell className="text-end">
                    Bs {Number(item.costo).toFixed(2)}
                  </CTableDataCell>

                  <CTableDataCell className="text-end">
                    Bs {Number(item.precio_venta).toFixed(2)}
                  </CTableDataCell>

                  <CTableDataCell className="text-end fw-bold">
                    Bs {item.subtotal.toFixed(2)}
                  </CTableDataCell>

                  <CTableDataCell className="text-center">
                    <CButton
                      size="sm"
                      variant="outline"
                      color="danger"
                      onClick={() => eliminarProducto(index)}
                      style={{
                        borderRadius: '10px',
                        width: 32,
                        height: 32,
                        padding: 0,
                      }}
                    >
                      ✕
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
      {/* ================= MODAL PRODUCTO RÁPIDO ================= */}
      <CModal
        visible={mostrarModalProducto}
        onClose={() => setMostrarModalProducto(false)}
        alignment="center"
        size="lg"
        backdrop="static"
      >
        <CModalHeader className="bg-light border-bottom">
          <CModalTitle className="fw-semibold">Nuevo Producto</CModalTitle>
        </CModalHeader>

        <CModalBody className="px-4 py-4">
          <CContainer fluid>
            {/* ================= DATOS GENERALES ================= */}
            <div className="mb-4">
              <h6 className="text-muted fw-bold mb-3">Información General</h6>

              <CRow className="g-3">
                <CCol xs={12} md={6}>
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

                <CCol xs={12} md={6}>
                  <CFormSelect
                    label="Marca"
                    value={nuevoProducto.marca_id}
                    onChange={(e) =>
                      setNuevoProducto({ ...nuevoProducto, marca_id: e.target.value })
                    }
                  >
                    <option value="">Seleccione</option>
                    {marcas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol xs={12}>
                  <CFormInput
                    label="Nombre *"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                  />
                </CCol>

                <CCol xs={12}>
                  <CFormInput
                    label="Descripción"
                    value={nuevoProducto.descripcion}
                    onChange={(e) =>
                      setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })
                    }
                  />
                </CCol>
              </CRow>
            </div>

            {/* ================= PRESENTACIÓN ================= */}
            <div className="mb-3">
              <h6 className="text-muted fw-bold mb-3">Presentación y Precio</h6>

              <CRow className="g-3">
                <CCol xs={12} md={6}>
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

                <CCol xs={12} md={6}>
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
                    <option value="PZA">PZA - Pieza</option>
                    <option value="KG">KG - Kilogramo</option>
                    <option value="LT">LT - Litro</option>
                    <option value="GR">GR - Gramo</option>
                  </CFormSelect>
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Precio venta *"
                    type="number"
                    value={nuevoProducto.precio_venta}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        precio_venta: e.target.value,
                      })
                    }
                  />
                </CCol>
              </CRow>
            </div>
          </CContainer>
        </CModalBody>

        {/* ================= FOOTER PROFESIONAL ================= */}
        <CModalFooter className="d-flex flex-column flex-md-row justify-content-end gap-2 px-4 py-3 border-top bg-light">
          <CButton
            color="primary"
            className="w-100 w-md-auto px-4"
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
            {guardandoProducto ? 'Guardando...' : 'Guardar Producto'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CompraNueva
