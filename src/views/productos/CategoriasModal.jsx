import React, { useEffect, useState } from 'react'
import {
  CModal, CModalHeader, CModalBody, CModalTitle,
  CTable, CButton, CFormInput, CBadge
} from '@coreui/react'
import { categoriasService } from '../../services/categorias.service'
import { alertSuccess } from '../../utils/alert'

const CategoriasModal = ({ visible, onClose, onSaved }) => {
  const [data, setData] = useState([])
  const [nombre, setNombre] = useState('')

  const cargar = async () => {
    const res = await categoriasService.listar()
    setData(res.data)
  }

  useEffect(() => {
    if (visible) cargar()
  }, [visible])

  const crear = async () => {
    await categoriasService.crear({ nombre })
    setNombre('')
    alertSuccess('Categoría creada')
    cargar()
    onSaved()
  }

  const toggle = async (c) => {
    await categoriasService.actualizar(c.id, {
      nombre: c.nombre,
      estado: !c.estado,
    })
    cargar()
    onSaved()
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>Categorías</CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CFormInput
          placeholder="Nueva categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <CButton color="primary" className="mt-2" onClick={crear}>
          Crear
        </CButton>

        <CTable striped hover className="mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>                
                <td>{c.nombre}</td>
                <td>
                  <CBadge color={c.estado ? 'success' : 'danger'}>
                    {c.estado ? 'Activo' : 'Inactivo'}
                  </CBadge>
                </td>
                <td>
                  <CButton color='info' size="sm" onClick={() => toggle(c)}>
                    {c.estado ? 'Desactivar' : 'Activar'}
                  </CButton>
                </td>
              </tr>
            ))}
          </tbody>
        </CTable>
      </CModalBody>
    </CModal>
  )
}

export default CategoriasModal
