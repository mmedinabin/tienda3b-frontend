import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import {
  CCard,
  CCardBody,
  CButton,
  CForm,
  CFormInput,
  CFormSwitch,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
} from '@coreui/react'

import { categoriasService } from '../../services/categorias.service'
import { marcasService } from '../../services/marcas.service'
import { productosService } from '../../services/productos.service'
import { alertSuccess, alertError, alertSuccessFast } from '../../utils/alert'

//const API_URL = 'http://localhost:5000'
const API_URL = import.meta.env.VITE_API_URL

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: 38,
    borderColor: '#d8dbe0',
    boxShadow: 'none',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}

const initialForm = {
  categoria_id: 0,
  marca_id: '',
  nombre: '',
  descripcion: '',
  stock_minimo: 1,
  precio_venta: '',
  imagen: null,
}

const ProductoForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState(initialForm)
  const [codigoInterno, setCodigoInterno] = useState('')
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [imagenPreview, setImagenPreview] = useState(null)

  const [modalCategoria, setModalCategoria] = useState(false)
  const [modalMarca, setModalMarca] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [nuevaMarca, setNuevaMarca] = useState('')

  const [tieneStockInicial, setTieneStockInicial] = useState(false)
  const [stockInicial, setStockInicial] = useState({
    cantidad: '',
    costo: '',
    tieneVencimiento: false,
    fecha_vencimiento: '',
  })

  useEffect(() => {
    const init = async () => {
      await cargarCategorias()
      await cargarMarcas()
      if (id) await cargarProducto()
    }
    init()
  }, [id])

  const cargarCategorias = async () => {
    const res = await categoriasService.listarActivas()
    setCategorias(res.data)
  }

  const cargarMarcas = async () => {
    const res = await marcasService.listar()
    setMarcas(res.data)
  }

  const cargarProducto = async () => {
    const res = await productosService.obtener(id)

    setForm({
      categoria_id: Number(res.data.categoria_id),
      marca_id: res.data.marca_id ?? '',
      nombre: res.data.nombre,
      descripcion: res.data.descripcion ?? '',
      stock_minimo: res.data.stock_minimo,
      precio_venta: res.data.precio_venta,
      imagen: null,
    })

    setCodigoInterno(res.data.codigo)
    // 🔥 Siempre usar backend (si no hay, usar default.png)
    const nombreImagen = res.data.imagen || 'default.png'

    setImagenPreview(`${API_URL}/uploads/productos/${nombreImagen}`)

    // if (res.data.imagen) {
    //   setImagenPreview(`${API_URL}/uploads/productos/${res.data.imagen}`)
    // }
  }

  const categoriaOptions = categorias.map((c) => ({
    value: c.id,
    label: c.nombre,
  }))

  const marcaOptions = marcas.map((m) => ({
    value: m.id,
    label: m.nombre,
  }))

  const validarFormulario = () => {
    if (!form.categoria_id) return 'Seleccione categoría'
    if (!form.nombre.trim()) return 'Nombre es obligatorio'

    const precio = Number(form.precio_venta)
    if (!precio || precio <= 0) return 'Precio de venta debe ser mayor a 0'

    if (esEdicion) {
      if (Number(form.stock_minimo) < 0) return 'Stock mínimo no puede ser negativo'
    }

    if (tieneStockInicial) {
      const cantidad = Number(stockInicial.cantidad)
      const costo = Number(stockInicial.costo)

      if (!cantidad || cantidad <= 0) return 'Cantidad inicial debe ser mayor a 0'

      if (!costo || costo <= 0) return 'Costo unitario debe ser mayor a 0'

      if (costo >= precio) return 'El costo unitario debe ser menor al precio de venta'

      if (stockInicial.tieneVencimiento) {
        if (!stockInicial.fecha_vencimiento) return 'Debe ingresar fecha de vencimiento'

        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        const fechaSeleccionada = new Date(stockInicial.fecha_vencimiento)
        fechaSeleccionada.setHours(0, 0, 0, 0)

        if (fechaSeleccionada <= hoy) return 'La fecha de vencimiento debe ser mayor al día actual'
      }
    }

    return null
  }

  const guardar = async () => {
    const error = validarFormulario()
    if (error) return alertError(error)

    try {
      const data = new FormData()

      data.append('categoria_id', form.categoria_id)
      if (form.marca_id) data.append('marca_id', form.marca_id)
      data.append('nombre', form.nombre)
      data.append('descripcion', form.descripcion)
      data.append('precio_venta', form.precio_venta)

      if (esEdicion) data.append('stock_minimo', form.stock_minimo)

      if (form.imagen) data.append('imagen', form.imagen)

      if (tieneStockInicial) {
        data.append('stock_inicial', stockInicial.cantidad)
        data.append('costo_inicial', stockInicial.costo)

        if (stockInicial.tieneVencimiento)
          data.append('fecha_vencimiento', stockInicial.fecha_vencimiento)
      }

      if (esEdicion) {
        await productosService.actualizar(id, data)
        alertSuccess('Producto actualizado')
      } else {
        await productosService.crear(data)
        alertSuccess('Producto creado')
      }

      navigate('/productos')
    } catch (error) {
      console.log('ERROR COMPLETO:', error)
      console.log('STATUS:', error?.response?.status)
      console.log('DATA:', error?.response?.data)

      const mensaje =
        error?.response?.data?.message || error?.response?.data?.sqlMessage || 'Error al guardar'

      alertError(mensaje)
    }
  }

  return (
    <>
      <h4 className="mb-3">{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h4>

      <CCard>
        <CCardBody>
          <CForm>
            <CRow>
              <CCol md={4}>
                {esEdicion && (
                  <div className="mb-2 text-muted">
                    Código: <strong>{codigoInterno}</strong>
                  </div>
                )}

                <div
                  style={{
                    border: '2px dashed #ccc',
                    borderRadius: 8,
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    background: '#f9f9f9',
                  }}
                >
                  <img
                    src={imagenPreview || `${API_URL}/uploads/productos/default.png`}
                    alt="Preview"
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  {/* {imagenPreview ? (
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                    />
                  ) : (
                    <span>Sin imagen</span>
                  )} */}
                </div>

                <CFormInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    setForm({ ...form, imagen: file })
                    setImagenPreview(URL.createObjectURL(file))
                  }}
                />
              </CCol>

              <CCol md={8}>
                {/* CATEGORIA */}
                <div className="d-flex gap-2 mb-3 align-items-end">
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Categoría *</label>
                    <Select
                      options={categoriaOptions}
                      value={
                        form.categoria_id
                          ? categoriaOptions.find((opt) => opt.value === form.categoria_id)
                          : null
                      }
                      onChange={(selected) =>
                        setForm({
                          ...form,
                          categoria_id: selected ? selected.value : 0,
                        })
                      }
                      placeholder="Seleccione..."
                      isClearable
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>

                  <CButton
                    color="success"
                    variant="outline"
                    style={{ height: 38 }}
                    onClick={() => setModalCategoria(true)}
                  >
                    Crear
                  </CButton>
                </div>

                {/* MARCA */}
                <div className="d-flex gap-2 mb-3 align-items-end">
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Marca</label>
                    <Select
                      options={marcaOptions}
                      value={
                        form.marca_id
                          ? marcaOptions.find((opt) => opt.value === form.marca_id)
                          : null
                      }
                      onChange={(selected) =>
                        setForm({
                          ...form,
                          marca_id: selected ? selected.value : '',
                        })
                      }
                      placeholder="Seleccione..."
                      isClearable
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>

                  <CButton
                    color="success"
                    variant="outline"
                    style={{ height: 38 }}
                    onClick={() => setModalMarca(true)}
                  >
                    Crear
                  </CButton>
                </div>

                <CFormInput
                  label="Nombre *"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="mb-3"
                />

                <CFormInput
                  label="Descripción"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="mb-3"
                />

                <CFormInput
                  label="Precio venta *"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precio_venta}
                  onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
                  className="mb-3"
                />

                {esEdicion && (
                  <CFormInput
                    label="Stock mínimo"
                    type="number"
                    min="0"
                    value={form.stock_minimo}
                    onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                    className="mb-3"
                  />
                )}

                {!esEdicion && (
                  <>
                    <CFormSwitch
                      label="Tiene stock inicial"
                      checked={tieneStockInicial}
                      onChange={(e) => setTieneStockInicial(e.target.checked)}
                    />

                    {tieneStockInicial && (
                      <CRow className="mt-3">
                        <CCol md={4}>
                          <CFormInput
                            label="Cantidad inicial *"
                            type="number"
                            min="0"
                            value={stockInicial.cantidad}
                            onChange={(e) =>
                              setStockInicial({
                                ...stockInicial,
                                cantidad: e.target.value,
                              })
                            }
                          />
                        </CCol>

                        <CCol md={4}>
                          <CFormInput
                            label="Costo unitario *"
                            type="number"
                            min="0"
                            step="0.01"
                            value={stockInicial.costo}
                            onChange={(e) =>
                              setStockInicial({
                                ...stockInicial,
                                costo: e.target.value,
                              })
                            }
                          />
                        </CCol>

                        <CCol md={4}>
                          <CFormSwitch
                            label="Tiene vencimiento"
                            checked={stockInicial.tieneVencimiento}
                            onChange={(e) =>
                              setStockInicial({
                                ...stockInicial,
                                tieneVencimiento: e.target.checked,
                              })
                            }
                          />
                        </CCol>

                        {stockInicial.tieneVencimiento && (
                          <CCol md={4} className="mt-3">
                            <CFormInput
                              label="Fecha vencimiento *"
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={stockInicial.fecha_vencimiento}
                              onChange={(e) =>
                                setStockInicial({
                                  ...stockInicial,
                                  fecha_vencimiento: e.target.value,
                                })
                              }
                              onClick={(e) => {
                                try {
                                  e.target.showPicker?.()
                                } catch {}
                              }}
                            />
                          </CCol>
                        )}
                      </CRow>
                    )}
                  </>
                )}
              </CCol>
            </CRow>

            <div className="mt-4 text-end">
              <CButton color="primary" size="lg" onClick={guardar}>
                {esEdicion ? 'Guardar cambios' : 'Guardar producto'}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      {/* MODAL CATEGORIA */}
      <CModal visible={modalCategoria} onClose={() => setModalCategoria(false)}>
        <CModalHeader>
          <CModalTitle>Nueva Categoría</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            label="Nombre"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalCategoria(false)}>
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={async () => {
              if (!nuevaCategoria.trim()) return

              const res = await categoriasService.crear({ nombre: nuevaCategoria })

              await cargarCategorias()

              setForm({ ...form, categoria_id: res.data.id })
              setNuevaCategoria('')
              setModalCategoria(false)

              alertSuccessFast('Categoría creada')
            }}
            // onClick={async () => {
            //   if (!nuevaCategoria.trim()) return
            //   const res = await categoriasService.crear({ nombre: nuevaCategoria })
            //   await cargarCategorias()
            //   setForm({ ...form, categoria_id: res.data.id })
            //   setNuevaCategoria('')
            //   setModalCategoria(false)
            // }}
          >
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL MARCA */}
      <CModal visible={modalMarca} onClose={() => setModalMarca(false)}>
        <CModalHeader>
          <CModalTitle>Nueva Marca</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            label="Nombre"
            value={nuevaMarca}
            onChange={(e) => setNuevaMarca(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalMarca(false)}>
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={async () => {
              if (!nuevaMarca.trim()) return

              const res = await marcasService.crear({ nombre: nuevaMarca })

              await cargarMarcas()

              setForm({ ...form, marca_id: res.data.id })
              setNuevaMarca('')
              setModalMarca(false)

              alertSuccessFast('Marca creada')
            }}
          >
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProductoForm
