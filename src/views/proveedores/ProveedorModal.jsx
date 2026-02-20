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
  CFormSwitch,
} from '@coreui/react'

const initialForm = {
  id: null,
  nombre: '',
  nit: '',
  ci: '',
  contacto: '',
  telefono: '',
  email: '',
  estado: true,
}

const ProveedorModal = ({ visible, onClose, onSave, proveedor }) => {
  const [form, setForm] = useState(initialForm)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  /* =========================
     RESPONSIVE
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
    if (proveedor) {
      setForm({
        ...proveedor,
        nit: proveedor.nit || '',
        ci: proveedor.ci || '',
        contacto: proveedor.contacto || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
      })
    } else {
      setForm(initialForm)
    }
  }, [proveedor])

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validación básica adicional UX
    if (!form.nombre.trim()) return
    if (!form.telefono.trim()) return

    onSave(form)
    setForm(initialForm)
  }

  const handleClose = () => {
    setForm(initialForm)
    onClose()
  }

  return (
    <CModal visible={visible} onClose={handleClose} backdrop="static">
      
      {/* HEADER */}
      <CModalHeader
        className="border-bottom"
        style={{ backgroundColor: '#f1f3f5' }}
      >
        <CModalTitle className="fw-semibold">
          {form.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody className="pt-4">

          {/* NOMBRE */}
          <CFormInput
            label="Nombre *"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="mb-3"
            required
            minLength={3}
          />

          {/* TELEFONO */}
          <CFormInput
            label="Teléfono *"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="mb-3"
            required
            minLength={5}
          />

          {/* NIT */}
          <CFormInput
            label="NIT"
            name="nit"
            value={form.nit}
            onChange={handleChange}
            className="mb-3"
          />

          {/* CI */}
          <CFormInput
            label="CI"
            name="ci"
            value={form.ci}
            onChange={handleChange}
            className="mb-3"
          />

          {/* CONTACTO */}
          <CFormInput
            label="Contacto"
            name="contacto"
            value={form.contacto}
            onChange={handleChange}
            className="mb-3"
          />

          {/* EMAIL */}
          <CFormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mb-3"
          />

          {/* ESTADO SOLO EN EDIT */}
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

        {/* FOOTER */}
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

export default ProveedorModal
