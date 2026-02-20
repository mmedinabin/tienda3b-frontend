import React, { useEffect, useState, useMemo } from 'react'
import { CCard, CCardBody, CButton, CBadge } from '@coreui/react'
import { proveedoresService } from '../../services/proveedores.service'
import ProveedorModal from './ProveedorModal'
import { alertSuccess, alertError } from '../../utils/alert'
import SmartTable from '../../components/SmartTable'

const Proveedores = () => {
  const [data, setData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [proveedorEdit, setProveedorEdit] = useState(null)

  const cargar = async () => {
    const res = await proveedoresService.listar()
    setData(res.data)
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (form) => {
    try {
      form.id
        ? await proveedoresService.actualizar(form.id, form)
        : await proveedoresService.crear(form)

      alertSuccess('Proveedor guardado correctamente')
      setModalVisible(false)
      cargar()
    } catch {
      alertError('Error al guardar proveedor')
    }
  }

  /* ================= COLUMNAS SMART TABLE ================= */
  const columns = useMemo(() => [
    {
      key: 'nombre',
      label: 'Nombre',
    },
    {
      key: 'nit',
      label: 'NIT',
    },
    {
      key: 'telefono',
      label: 'Teléfono',
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        row.estado
          ? <CBadge color="success">Activo</CBadge>
          : <CBadge color="danger">Inactivo</CBadge>
      ),
    },
    {
      key: 'acciones',
      label: '',
      render: (row) => (
        <CButton
          size="sm"
          color="info"
          onClick={() => {
            setProveedorEdit(row)
            setModalVisible(true)
          }}
        >
          Editar
        </CButton>
      ),
    },
  ], [])

  return (
    <>
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between mb-3">
            <h4>Proveedores</h4>

            <CButton
              color="primary"
              onClick={() => {
                setProveedorEdit(null)
                setModalVisible(true)
              }}
            >
              Nuevo Proveedor
            </CButton>
          </div>

          <SmartTable
            columns={columns}
            data={data}
            pageSize={10}
          />
        </CCardBody>
      </CCard>

      <ProveedorModal
        visible={modalVisible}
        onClose={() => {
          setProveedorEdit(null)
          setModalVisible(false)
        }}
        onSave={guardar}
        proveedor={proveedorEdit}
      />
    </>
  )
}

export default Proveedores
