import React, { useEffect, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CFormSwitch,
} from '@coreui/react'

const initialForm = {
  id: null,
  tipo: 'NATURAL',
  nombre: '',
  documento: '',
  telefono: '',
  email: '',
  direccion: '',
  estado: true,
}

const ClienteModal = ({ visible, onClose, onSave, cliente }) => {
  const [form, setForm] = useState(initialForm)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  /* =========================
     DETECTAR RESPONSIVE
  ========================= */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* =========================
     CARGAR DATOS
  ========================= */
  useEffect(() => {
    cliente ? setForm({ ...cliente }) : setForm(initialForm)
  }, [cliente])

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  const handleClose = () => {
    setForm(initialForm)
    onClose()
  }

  return (
    <CModal visible={visible} onClose={handleClose} backdrop="static">

      {/* HEADER SOBRIO */}
      <CModalHeader
        className="border-bottom"
        style={{ backgroundColor: '#f1f3f5' }}
      >
        <CModalTitle className="fw-semibold">
          {form.id ? 'Editar Cliente' : 'Nuevo Cliente'}
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody className="pt-4">

          <CFormSelect
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="mb-3"
          >
            <option value="NATURAL">Persona Natural</option>
            <option value="EMPRESA">Empresa</option>
          </CFormSelect>

          <CFormInput
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="mb-3"
            required
          />

          <CFormInput
            label="CI / NIT"
            name="documento"
            value={form.documento || ''}
            onChange={handleChange}
            className="mb-3"
          />

          <CFormInput
            label="Teléfono"
            name="telefono"
            value={form.telefono || ''}
            onChange={handleChange}
            className="mb-3"
          />

          <CFormInput
            label="Email"
            name="email"
            value={form.email || ''}
            onChange={handleChange}
            className="mb-3"
          />

          <CFormInput
            label="Dirección"
            name="direccion"
            value={form.direccion || ''}
            onChange={handleChange}
            className="mb-3"
          />

          {form.id && (
            <CFormSwitch
              label="Activo"
              name="estado"
              checked={!!form.estado}
              onChange={handleChange}
              className="mt-2"
            />
          )}

        </CModalBody>

        {/* FOOTER LIMPIO */}
        <CModalFooter className="border-top pt-3 pb-3 d-flex justify-content-end">

          <CButton
            type="submit"
            color="primary"
            size={isMobile ? 'lg' : undefined}
            style={{
              minHeight: 48,
              fontWeight: 600,
              fontSize: '1rem',
              width: isMobile ? '100%' : '180px',
            }}
          >
            Guardar
          </CButton>

        </CModalFooter>
      </CForm>

    </CModal>
  )
}

export default ClienteModal
