import React, { useEffect, useState, useMemo } from 'react'
import { CCard, CCardBody, CButton, CBadge, CTooltip } from '@coreui/react'
import { productosService } from '../../services/productos.service'
import { alertConfirm, alertSuccess, alertError } from '../../utils/alert'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilBan, cilCheck } from '@coreui/icons'
import SmartTable from '../../components/SmartTable'

const Productos = () => {
  const API_URL = import.meta.env.VITE_API_URL
  const [data, setData] = useState([])
  const navigate = useNavigate()

  const cargar = async () => {
    const res = await productosService.listar()
    setData(res.data)
  }

  useEffect(() => {
    cargar()
  }, [])

  const toggleEstado = async (p) => {
    const ok = await alertConfirm(
      `${p.estado ? 'Desactivar' : 'Activar'} producto`,
      `¿Desea ${p.estado ? 'desactivar' : 'activar'} el producto "${p.nombre}"?`,
    )
    if (!ok) return

    try {
      await productosService.cambiarEstado(p.id, !p.estado)
      alertSuccess('Estado actualizado')
      cargar()
    } catch {
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
      // {
      //   key: 'imagen',
      //   label: 'Imagen',
      //   render: (row) => (
      //     <img
      //       src={`${API_URL}/uploads/productos/${row.imagen || 'default.png'}`}
      //       width="40"
      //       height="40"
      //       style={{ objectFit: 'cover', borderRadius: 4 }}
      //       alt="producto"
      //       onError={(e) => {
      //         e.target.src = `${API_URL}/uploads/productos/default.png`
      //       }}
      //     />
      //   ),
      // },
      {
        key: 'categoria',
        label: 'Categoría',
      },
      {
        key: 'marca',
        label: 'Marca',
        render: (row) => (
          <span className={!row.marca ? 'text-muted' : ''}>
            {row.marca && row.marca.trim() !== '' ? row.marca : '-'}
          </span>
        ),
      },
      // {
      //   key: 'nombre',
      //   label: 'Descripción',
      //   render: (row) => (
      //     <div>
      //       <div className="fw-semibold">{row.nombre}</div>

      //       {row.descripcion && row.descripcion.trim() !== '' && (
      //         <div className="text-muted small">{row.descripcion}</div>
      //       )}

      //       <div className="text-muted small">
      //         {row.tipo_presentacion} {row.unidad_medida}
      //       </div>
      //     </div>
      //   ),
      // },
      {
        key: 'nombre',
        label: 'Descripción',
        render: (row) => (
          <div>
            <div className="fw-semibold">{row.nombre}</div>

            {row.descripcion && row.descripcion.trim() !== '' && (
              <div className="text-muted small">{row.descripcion}</div>
            )}
          </div>
        ),
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

  const columnss = useMemo(
    () => [
      {
        key: 'codigo',
        label: 'Código',
      },
      {
        key: 'imagen',
        label: 'Imagen',
        render: (row) => (
          <img
            src={`${API_URL}/uploads/productos/${row.imagen || 'default.png'}`}
            width="40"
            height="40"
            style={{ objectFit: 'cover', borderRadius: 4 }}
            alt="producto"
            onError={(e) => {
              e.target.src = `${API_URL}/uploads/productos/default.png`
            }}
          />
        ),
      },

      // {
      //   key: 'imagen',
      //   label: 'Imagen',
      //   render: (row) => (
      //     <img
      //       src={`http://localhost:5000/uploads/productos/${row.imagen}`}
      //       width="40"
      //       height="40"
      //       style={{ objectFit: 'cover', borderRadius: 4 }}
      //       alt="producto"
      //     />
      //   ),
      // },
      {
        key: 'categoria',
        label: 'Categoría',
      },
      {
        key: 'nombre',
        label: 'Nombre',
      },
      {
        key: 'descripcion',
        label: 'Descripción',
      },
      {
        key: 'precio_venta',
        label: 'Precio/Venta',
        render: (row) => `Bs ${Number(row.precio_venta).toFixed(2)}`,
        //render: (row) => Number(row.precio_venta).toFixed(2),
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

  return (
    <CCard>
      <CCardBody>
        <div className="d-flex justify-content-between mb-3">
          <h4>Productos</h4>

          <CButton color="primary" onClick={() => navigate('/productos/nuevo')}>
            Nuevo Producto
          </CButton>
        </div>

        <SmartTable columns={columns} data={data} pageSize={10} />
      </CCardBody>
    </CCard>
  )
}

export default Productos
