import React, { useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
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

import { ciudadesService } from '../../services/ciudades.service'

const initialForm = {
  id: null,
  ciudad_id: null,
  nuevaCiudadNombre: '',
  nuevaCiudadCodigo: '',
  nombre: '',
  direccion: '',
  telefono: '',
  estado: true,
}

const SucursalModal = ({ visible, onClose, onSave, sucursal }) => {
  const [form, setForm] = useState(initialForm)
  const [ciudades, setCiudades] = useState([])
  const [selectedCiudad, setSelectedCiudad] = useState(null)
  const [esNuevaCiudad, setEsNuevaCiudad] = useState(false)
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
     CARGAR CIUDADES
  ========================= */
  useEffect(() => {
    const cargarCiudades = async () => {
      try {
        const res = await ciudadesService.listar()

        const opciones = res.data.map((c) => ({
          value: c.id,
          label: c.nombre,
        }))

        setCiudades(opciones)
      } catch {
        console.error('Error cargando ciudades')
      }
    }

    cargarCiudades()
  }, [])

  /* =========================
     RESET AL ABRIR
  ========================= */
  useEffect(() => {
    if (sucursal) {
      setForm({ ...sucursal })
    } else {
      setForm(initialForm)
      setSelectedCiudad(null)
      setEsNuevaCiudad(false)
    }
  }, [sucursal])

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCiudadChange = (option) => {
    if (!option) {
      setSelectedCiudad(null)
      setEsNuevaCiudad(false)
      setForm((prev) => ({ ...prev, ciudad_id: null }))
      return
    }

    if (option.__isNew__) {
      setEsNuevaCiudad(true)
      setSelectedCiudad({ label: option.label })

      setForm((prev) => ({
        ...prev,
        ciudad_id: null,
        nuevaCiudadNombre: option.label,
      }))
    } else {
      setEsNuevaCiudad(false)
      setSelectedCiudad(option)

      setForm((prev) => ({
        ...prev,
        ciudad_id: option.value,
        nuevaCiudadNombre: '',
        nuevaCiudadCodigo: '',
      }))
    }
  }

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      let ciudadIdFinal = form.ciudad_id

      if (esNuevaCiudad) {
        if (!form.nuevaCiudadCodigo) {
          alert('Debe ingresar código de ciudad')
          return
        }

        await ciudadesService.crear({
          nombre: form.nuevaCiudadNombre,
          codigo: form.nuevaCiudadCodigo.toUpperCase(),
        })

        const ciudadesActualizadas = await ciudadesService.listar()

        const creada = ciudadesActualizadas.data.find(
          (c) => c.nombre.toLowerCase() === form.nuevaCiudadNombre.toLowerCase(),
        )

        ciudadIdFinal = creada?.id
      }

      // 🔥 VALIDACIÓN QUE FALTABA
      if (!ciudadIdFinal) {
        alert('Debe seleccionar una ciudad')
        return
      }

      if (!form.nombre) {
        alert('Debe ingresar nombre de sucursal')
        return
      }

      onSave({
        ciudad_id: Number(ciudadIdFinal),
        nombre: form.nombre,
        direccion: form.direccion,
        telefono: form.telefono,
        estado: form.estado,
      })

      setForm(initialForm)
    } catch {
      alert('Error al procesar datos')
    }
  }

  const handleClose = () => {
    setForm(initialForm)
    onClose()
  }

  return (
    <CModal visible={visible} onClose={handleClose} backdrop="static">
      {/* HEADER SOBRIO */}
      <CModalHeader className="border-bottom" style={{ backgroundColor: '#f1f3f5' }}>
        <CModalTitle className="fw-semibold">
          {form.id ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody className="pt-4">
          {!form.id && (
            <>
              <div className="mb-3">
                <label className="form-label">Ciudad</label>
                <CreatableSelect
                  options={ciudades}
                  value={selectedCiudad}
                  onChange={handleCiudadChange}
                  isClearable
                  placeholder="Escriba o seleccione ciudad..."
                  formatCreateLabel={(inputValue) => `Crear ciudad "${inputValue}"`}
                />
              </div>

              {esNuevaCiudad && (
                <CFormInput
                  label="Código Ciudad"
                  name="nuevaCiudadCodigo"
                  value={form.nuevaCiudadCodigo}
                  onChange={handleChange}
                  className="mb-3"
                  placeholder="Ej: LPZ, SCZ..."
                  required
                />
              )}
            </>
          )}

          <CFormInput
            label="Nombre Sucursal"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="mb-3"
            placeholder="Ej: Casa Matriz, Central, etc"
            required
          />

          <CFormInput
            label="Dirección"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className="mb-3"
            placeholder=""
            required
          />

          <CFormInput
            label="Teléfono"
            name="telefono"
            value={form.telefono || ''}
            onChange={handleChange}
            className="mb-3"
          />

          {form.id && (
            <CFormSwitch
              label="Activo"
              name="estado"
              checked={form.estado}
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
              width: isMobile ? '100%' : '190px',
            }}
          >
            Guardar
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default SucursalModal
