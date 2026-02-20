import React, { useEffect, useState, useMemo } from 'react'
import { CCard, CCardBody, CButton, CBadge } from '@coreui/react'

import { sucursalesService } from '../../services/sucursales.service'
import SucursalModal from './SucursalModal'
import { alertSuccess, alertError } from '../../utils/alert'
import SmartTable from '../../components/SmartTable'

const Sucursales = () => {
  const [data, setData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [sucursalEdit, setSucursalEdit] = useState(null)

  const cargar = async () => {
    try {
      const res = await sucursalesService.listar()
      setData(res.data)
    } catch (error) {
      alertError('Error al cargar sucursales')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const openNuevo = () => {
    setSucursalEdit(null)
    setModalVisible(true)
  }

  const openEditar = (s) => {
    setSucursalEdit(s)
    setModalVisible(true)
  }

  const guardar = async (form) => {
    try {
      if (form.id) {
        await sucursalesService.actualizar(form.id, form)
        alertSuccess('Sucursal actualizada correctamente')
      } else {
        await sucursalesService.crear(form)
        alertSuccess('Sucursal creada correctamente')
      }

      setModalVisible(false)
      cargar()
    } catch (error) {
      alertError('Error al guardar la sucursal')
    }
  }

  /* ================= COLUMNAS SMART TABLE ================= */
  const columns = useMemo(
    () => [
      {
        key: 'codigo_sucursal',
        label: 'Código',
        render: (row) => <strong>{row.codigo_sucursal}</strong>,
      },
      {
        key: 'ciudad',
        label: 'Ciudad',
      },
      {
        key: 'nombre',
        label: 'Nombre',
      },
      {
        key: 'direccion',
        label: 'Dirección',
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
        label: 'Acciones',
        render: (row) => (
          <CButton size="sm" color="info" onClick={() => openEditar(row)}>
            Editar
          </CButton>
        ),
      },
    ],
    [],
  )

  return (
    <>
      <CCard>
        <CCardBody>
          {/* 🔹 Botón alineado a la izquierda (igual que Clientes) */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Sucursales</h4>

            <CButton color="primary" onClick={openNuevo}>
              Nueva Sucursal
            </CButton>
          </div>

          <SmartTable columns={columns} data={data} pageSize={10} />
        </CCardBody>
      </CCard>

      <SucursalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={guardar}
        sucursal={sucursalEdit}
      />
    </>
  )
}

export default Sucursales
