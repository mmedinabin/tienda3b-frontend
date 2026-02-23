import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CButton, CSpinner, CBadge } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { ventasService } from '../../services/ventas.service'
import SmartTable from '../../components/SmartTable'
import Swal from 'sweetalert2'

const Ventas = () => {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarVentas()
  }, [])

  const cargarVentas = async () => {
    try {
      const { data } = await ventasService.listar()
      setVentas(data)
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Error cargando ventas',
      })
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

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Historial de Ventas</h4>

        <CButton color="primary" onClick={() => navigate('/ventas/nuevo')}>
          Nueva venta
        </CButton>
      </div>

      <CCard>
        <CCardBody>
          {cargando ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center text-muted p-4">No existen ventas registradas</div>
          ) : (
            <SmartTable columns={columns} data={ventas} pageSize={10} />
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Ventas
