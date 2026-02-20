import React, { useEffect, useState, useMemo } from 'react'
import { CCard, CCardBody, CButton, CBadge } from '@coreui/react'
import { clientesService } from '../../services/clientes.service'
import ClienteModal from './ClienteModal'
import { alertSuccess, alertError } from '../../utils/alert'
import SmartTable from '../../components/SmartTable'

const Clientes = () => {
  const [data, setData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [clienteEdit, setClienteEdit] = useState(null)

  const cargar = async () => {
    const res = await clientesService.listar()
    setData(res.data)
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (form) => {
    try {
      form.id
        ? await clientesService.actualizar(form.id, form)
        : await clientesService.crear(form)

      alertSuccess('Cliente guardado correctamente')
      setModalVisible(false)
      cargar()
    } catch {
      alertError('Error al guardar cliente')
    }
  }

  /* ================= COLUMNAS SMART TABLE ================= */
  const columns = useMemo(() => [
    {
      key: 'tipo',
      label: 'Tipo',
    },
    {
      key: 'nombre',
      label: 'Nombre',
    },
    {
      key: 'documento',
      label: 'Documento',
    },
    {
      key: 'telefono',
      label: 'Teléfono',
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
      label: '',
      render: (row) => (
        <CButton
          size="sm"
          color="info"
          onClick={() => {
            setClienteEdit(row)
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
            <h4>Clientes</h4>

            <CButton
              color="primary"
              onClick={() => {
                setClienteEdit(null)
                setModalVisible(true)
              }}
            >
              Nuevo Cliente
            </CButton>
          </div>

          <SmartTable
            columns={columns}
            data={data}
            pageSize={10}
          />
        </CCardBody>
      </CCard>

      <ClienteModal
        visible={modalVisible}
        onClose={() => {
          setClienteEdit(null)
          setModalVisible(false)
        }}
        onSave={guardar}
        cliente={clienteEdit}
      />
    </>
  )
}

export default Clientes
