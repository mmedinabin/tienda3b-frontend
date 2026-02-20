import React, { useEffect, useState, useMemo } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CBadge,
} from '@coreui/react'
import { usuariosService } from '../../services/usuarios.service'
import { useNavigate } from 'react-router-dom'
import SmartTable from '../../components/SmartTable'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    usuariosService.listar().then((res) => setUsuarios(res.data))
  }, [])

  /* ================= COLUMNAS SMART TABLE ================= */
  const columns = useMemo(() => [
    {
      key: 'username',
      label: 'Username',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'nombre',
      label: 'Nombre',
    },
    {
      key: 'rol',
      label: 'Rol',
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      render: (row) =>
        row.sucursal_id ? (
          <>
            {row.ciudad} - {row.sucursal_nombre} [{row.codigo_sucursal}]
          </>
        ) : (
          <CBadge color="secondary">Global</CBadge>
        ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) =>
        row.estado ? (
          <CBadge color="success">Activo</CBadge>
        ) : (
          <CBadge color="danger">Inactivo</CBadge>
        ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (row) => (
        <CButton
          size="sm"
          color="info"
          onClick={() => navigate(`/usuarios/${row.id}/editar`)}
        >
          Editar
        </CButton>
      ),
    },
  ], [navigate])

  return (
    <CCard>
      <CCardBody>
        <div className="d-flex justify-content-between mb-3">
          <h4>Usuarios</h4>

          <CButton
            color="primary"
            onClick={() => navigate('/usuarios/nuevo')}
          >
            Nuevo Usuario
          </CButton>
        </div>

        <SmartTable
          columns={columns}
          data={usuarios}
          pageSize={10}
        />
      </CCardBody>
    </CCard>
  )
}

export default Usuarios
