import React, { useEffect, useState, useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CBadge,
} from '@coreui/react'
import {
  listarEmpleados,
  cambiarEstadoEmpleado,
} from '../../services/empleados.service'
import { useNavigate } from 'react-router-dom'
import SmartTable from '../../components/SmartTable'

const Empleados = () => {
  const [empleados, setEmpleados] = useState([])
  const navigate = useNavigate()

  const cargar = async () => {
    const res = await listarEmpleados()
    setEmpleados(res.data)
  }

  useEffect(() => {
    cargar()
  }, [])

  const toggleEstado = async (id) => {
    await cambiarEstadoEmpleado(id)
    cargar()
  }

  /* ================= COLUMNAS SMART TABLE ================= */
  const columns = useMemo(() => [
    {
      key: 'nombre_completo',
      label: 'Nombre',
      render: (row) => `${row.nombres} ${row.apellidos}`,
    },
    {
      key: 'ci_doc',
      label: 'CI',
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      render: (row) =>
        `${row.ciudad} - ${row.sucursal_nombre} (${row.codigo_sucursal})`,
    },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (row) => row.usuario || <em>—</em>,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) =>
        row.estado ? (
          <CBadge color="success">Activo</CBadge>
        ) : (
          <CBadge color="secondary">Inactivo</CBadge>
        ),
    },
    {
      key: 'acciones',
      label: '',
      render: (row) => (
        <>
          <CButton
            size="sm"
            color="info"
            className="me-2"
            onClick={() => navigate(`/empleados/editar/${row.id}`)}
          >
            Editar
          </CButton>

          <CButton
            size="sm"
            color={row.estado ? 'danger' : 'success'}
            onClick={() => toggleEstado(row.id)}
          >
            {row.estado ? 'Desactivar' : 'Activar'}
          </CButton>
        </>
      ),
    },
  ], [navigate])

  return (
    <CCard>
      <CCardBody>
        {/* 🔹 Igual que Clientes */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Empleados</h4>

          <CButton
            color="primary"
            onClick={() => navigate('/empleados/nuevo')}
          >
            Nuevo Empleado
          </CButton>
        </div>

        <SmartTable
          columns={columns}
          data={empleados}
          pageSize={10}
        />
      </CCardBody>
    </CCard>
  )
}

export default Empleados
