import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/auth.store'
import {
  CCard,
  CCardBody,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import comprasService from '../../services/compras.service'
import SmartTable from '../../components/SmartTable'

const Compras = () => {
  const sucursalActiva = useAuthStore((state) => state.sucursalActiva)

  const navigate = useNavigate()
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    if (!sucursalActiva) {
      setCompras([])
      setCargando(false)
      return
    }

    const cargarCompras = async () => {
      try {
        setCargando(true)
        const { data } = await comprasService.listar()
        setCompras(data)
      } catch (error) {
        console.error('Error cargando compras')
      } finally {
        setCargando(false)
      }
    }

    cargarCompras()
  }, [sucursalActiva])
  // useEffect(() => {
  //   const cargarCompras = async () => {
  //     try {
  //       const { data } = await comprasService.listar()
  //       setCompras(data)
  //     } catch (error) {
  //       console.error('Error cargando compras')
  //     } finally {
  //       setCargando(false)
  //     }
  //   }

  //   cargarCompras()
  // }, [])

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
      render: (row) =>
        Number(row.saldo) > 0 ? (
          <CBadge color="warning">Pendiente</CBadge>
        ) : (
          <CBadge color="success">Pagado</CBadge>
        ),
    },
    // {
    //   key: 'acciones',
    //   label: '',
    //   render: (row) => (
    //     <CButton size="sm" color="info" onClick={() => navigate(`/compras/${row.id}`)}>
    //       Ver
    //     </CButton>
    //   ),
    // },

    {
      key: 'acciones',
      label: '',
      render: (row) => (
        <CButton
          size="sm"
          color="info"
          onClick={async () => {
            try {
              const token = useAuthStore.getState().token

              if (!token) {
                alert('Sesión expirada')
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
                const link = document.createElement('a')
                link.href = url
                link.download = `compra-${row.codigo}.pdf`
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
                title: 'Sesión expirada',
              })
            }
          }}
        >
          Ver PDF
        </CButton>
      ),
    },
  ]

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
            <SmartTable columns={columns} data={compras} pageSize={10} />
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Compras
