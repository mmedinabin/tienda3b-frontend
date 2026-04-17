import React, { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '../../store/auth.store'
import {
  CCard,
  CCardBody,
  CButton,
  CBadge,
  CTooltip,
  CSpinner,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { productosService } from '../../services/productos.service'
import { alertConfirm, alertSuccess, alertError } from '../../utils/alert'
import { useNavigate } from 'react-router-dom'
import { CFormInput } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilBan, cilCheck, cilSearch } from '@coreui/icons'
import SmartTable from '../../components/SmartTable'

const Productos = () => {
  const sucursalActiva = useAuthStore((state) => state.sucursalActiva)
  const API_URL = import.meta.env.VITE_API_URL
  const [data, setData] = useState([])
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true)

        const { data } = await productosService.listar()

        // Compatible con formato nuevo y viejo
        setProductos(data.data ?? data)
      } catch (error) {
        console.error('Error cargando productos', error)
        setProductos([])
      } finally {
        setCargando(false)
      }
    }

    cargarProductos()
  }, [sucursalActiva]) // 🔥 ahora reacciona a modo global

  const cargar = async () => {
    try {
      setCargando(true)

      const { data } = await productosService.listar()

      setData(data.data ?? data)
    } catch (error) {
      console.error('Error cargando productos', error)
      setData([])
    } finally {
      setCargando(false)
    }
  }

  const toggleEstado = async (p) => {
    const ok = await alertConfirm(
      `${p.estado ? 'Desactivar' : 'Activar'} producto`,
      `¿Desea ${p.estado ? 'desactivar' : 'activar'} el producto "${p.nombre}"?`,
    )

    if (!ok) return

    try {
      await productosService.cambiarEstado(p.id, !p.estado)

      // 🔥 Actualizar estado local inmediatamente
      setProductos((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, estado: !item.estado } : item)),
      )

      alertSuccess('Estado actualizado')
    } catch (error) {
      alertError('Error al actualizar estado')
    }
  }

  /* ================= COLUMNAS SMART TABLE ================= */
  const columns = useMemo(
    () => [
      {
        key: 'codigo',
        label: 'Código',
      },
      {
        key: 'imagen',
        label: 'Imagen',
        render: (row) => {
          // Si es null, vacío o default.png → mostrar "-"
          if (!row.imagen || row.imagen === 'default.png') {
            return <span className="text-muted">-</span>
          }

          return (
            <img
              src={`${API_URL}/uploads/productos/${row.imagen}`}
              width="40"
              height="40"
              style={{ objectFit: 'cover', borderRadius: 4 }}
              alt="producto"
            />
          )
        },
      },
      {
        key: 'categoria',
        label: 'Categoría',
      },
      {
        key: 'nombre',
        label: 'Descripción',
        render: (row) => {
          const nombre = row.nombre || ''
          const marca = row.marca?.trim()
          const descripcion = row.descripcion?.trim()

          // Primera palabra
          const primeraPalabra = nombre.split(' ')[0]

          // Resto del nombre
          const resto = nombre.substring(primeraPalabra.length).trim()

          // Construcción final
          const nombreFormateado = [primeraPalabra, marca || null, resto || null]
            .filter(Boolean)
            .join(' ')

          return (
            <div>
              <div className="fw-semibold">{nombreFormateado}</div>

              {descripcion && <div className="text-muted small">{descripcion}</div>}
            </div>
          )
        },
      },
      {
        key: 'stock',
        label: 'Stock',
        render: (row) => {
          const stock = Number(row.stock ?? 0)

          if (stock === 0) {
            return (
              <CBadge color="danger" shape="rounded-pill">
                Agotado
              </CBadge>
            )
          }

          if (stock <= 5) {
            return (
              <CBadge color="warning" shape="rounded-pill">
                {stock}
              </CBadge>
            )
          }

          return (
            <CBadge color="success" shape="rounded-pill">
              {stock}
            </CBadge>
          )
        },
      },
      {
        key: 'precio_venta',
        label: 'Precio/Venta',
        render: (row) => (
          <span className="fw-semibold text-success">Bs {Number(row.precio_venta).toFixed(2)}</span>
        ),
      },
      {
        key: 'estado',
        label: 'Estado',
        render: (row) => (
          <CBadge color={row.estado ? 'success' : 'danger'}>
            {row.estado ? 'Activo' : 'Inactivo'}
          </CBadge>
        ),
      },
      {
        key: 'acciones',
        label: 'Acciones',
        render: (row) => (
          <div className="d-flex gap-2 justify-content-end">
            <CTooltip content="Editar producto">
              <CButton
                size="sm"
                color="info"
                variant="outline"
                onClick={() => navigate(`/productos/editar/${row.id}`)}
              >
                <CIcon icon={cilPencil} />
              </CButton>
            </CTooltip>

            <CTooltip content={row.estado ? 'Desactivar producto' : 'Activar producto'}>
              <CButton
                size="sm"
                color={row.estado ? 'danger' : 'success'}
                variant="outline"
                onClick={() => toggleEstado(row)}
              >
                <CIcon icon={row.estado ? cilBan : cilCheck} />
              </CButton>
            </CTooltip>
          </div>
        ),
      },
    ],
    [],
  )

  const ProductoCard = ({ producto, index, onEditar, onToggle }) => {
    const nombre = producto.nombre || ''
    const marca = producto.marca?.trim()
    const descripcion = producto.descripcion?.trim()

    const primeraPalabra = nombre.split(' ')[0]
    const resto = nombre.substring(primeraPalabra.length).trim()

    const nombreFormateado = [primeraPalabra, marca || null, resto || null]
      .filter(Boolean)
      .join(' ')

    const stock = Number(producto.stock ?? 0)

    let stockColor = '#198754' // success
    if (stock === 0) stockColor = '#dc3545'
    else if (stock <= 5) stockColor = '#ffc107'

    return (
      <CCard
        className="mb-3"
        style={{
          backgroundColor: '#ffffff', // 👈 FIX fondo
          borderRadius: '20px',
          border: '1px solid #dee0e0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        }}
      >
        <CCardBody style={{ color: '#000' }}>
          {' '}
          {/* 👈 FIX texto global */}
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 500 }}>
              #{index + 1} · {producto.codigo}
            </div>

            <CBadge color={producto.estado ? 'success' : 'secondary'} shape="rounded-pill">
              {producto.estado ? 'Activo' : 'Inactivo'}
            </CBadge>
          </div>
          {/* CATEGORÍA */}
          {producto.categoria && (
            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{producto.categoria}</div>
          )}
          {/* NOMBRE */}
          <div
            style={{
              fontWeight: 600,
              marginBottom: '4px',
              color: '#000',
            }}
          >
            {nombreFormateado}
          </div>
          {/* DESCRIPCIÓN */}
          {descripcion && (
            <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '6px' }}>
              {descripcion}
            </div>
          )}
          {/* PRECIO */}
          <div
            style={{
              fontWeight: 700,
              fontSize: '1.2rem',
              color: '#198754',
            }}
          >
            Bs {Number(producto.precio_venta).toFixed(2)}
          </div>
          {/* STOCK */}
          <div
            style={{
              fontSize: '0.8rem',
              marginTop: '4px',
              color: stockColor,
            }}
          >
            Stock: {stock}
          </div>
          {/* BOTONES */}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <CButton size="sm" color="info" variant="outline" onClick={onEditar}>
              <CIcon icon={cilPencil} />
            </CButton>

            <CButton
              size="sm"
              color={producto.estado ? 'danger' : 'success'}
              variant="outline"
              onClick={onToggle}
            >
              <CIcon icon={producto.estado ? cilBan : cilCheck} />
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    )
  }

  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const porPagina = 5

  useEffect(() => {
    setPagina(1)
  }, [busqueda])

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos

    const texto = busqueda.toLowerCase()

    return productos.filter((producto) =>
      Object.values(producto).join(' ').toLowerCase().includes(texto),
    )
  }, [productos, busqueda])

  const totalPaginas = Math.ceil(productosFiltrados.length / porPagina)

  const productosPaginados = productosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina)

  return (
    <CCard>
      <CCardBody>
        <div className="d-flex justify-content-between mb-3">
          <h4>Productos</h4>

          <CButton color="primary" onClick={() => navigate('/productos/nuevo')}>
            Nuevo Producto
          </CButton>
        </div>
        {/* 🔍 BUSCADOR MOBILE */}
        <div className="d-md-none mb-3">
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </CInputGroup>
        </div>

        {cargando ? (
          <div className="text-center p-4">
            <CSpinner color="primary" />
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center text-muted p-4">No existen productos registrados</div>
        ) : (
          <>
            {/* 📱 MOBILE */}
            {/* MOBILE */}
            <div className="d-md-none">
              {/* PAGINACIÓN ARRIBA */}
              <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                <CButton
                  size="sm"
                  variant="outline"
                  disabled={pagina === 1}
                  onClick={() => setPagina(pagina - 1)}
                >
                  ‹
                </CButton>

                <span className="small">
                  Página {pagina} de {totalPaginas}
                </span>

                <CButton
                  size="sm"
                  variant="outline"
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina(pagina + 1)}
                >
                  ›
                </CButton>
              </div>

              {productosPaginados.map((p, index) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  index={(pagina - 1) * porPagina + index}
                  onEditar={() => navigate(`/productos/editar/${p.id}`)}
                  onToggle={() => toggleEstado(p)}
                />
              ))}
            </div>

            {/* 🖥 DESKTOP */}
            <div className="d-none d-md-block">
              <SmartTable columns={columns} data={productos} pageSize={10} />
            </div>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Productos
