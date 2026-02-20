import React, { useEffect, useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
} from '@coreui/react'
import {
  crearEmpleado,
  obtenerEmpleado,
  actualizarEmpleado,
  obtenerUsuariosDisponibles,
} from '../../services/empleados.service'
import api from '../../api/api'
import { useNavigate, useParams } from 'react-router-dom'

const EmpleadoForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = !!id

  const [usuarios, setUsuarios] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [tieneUsuario, setTieneUsuario] = useState(false)

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    ci_doc: '',
    telf_cel: '',
    sueldo: '',
    sucursal_id: '',
    usuario_id: '',
    en_planilla: true,
    estado: true,
  })

  /* =========================
     CARGA INICIAL
  ========================= */
  useEffect(() => {
    obtenerUsuariosDisponibles().then((res) => setUsuarios(res.data))
    api.get('/sucursales').then((res) => setSucursales(res.data))

    if (editando) {
      obtenerEmpleado(id).then((res) => {
        const data = res.data

        setForm({
          ...data,
          sucursal_id: Number(data.sucursal_id),
          usuario_id: data.usuario_id ? Number(data.usuario_id) : '',
        })

        setTieneUsuario(!!data.usuario_id)
      })
    }
  }, [id])

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    let newValue = value
    if (type === 'checkbox') newValue = checked
    if (name === 'sucursal_id' || name === 'usuario_id') {
      newValue = value ? Number(value) : ''
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      ...form,
      usuario_id: tieneUsuario ? form.usuario_id : null,
    }

    try {
      if (editando) {
        await actualizarEmpleado(id, payload)
      } else {
        await crearEmpleado(payload)
      }

      navigate('/empleados')
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar')
    }
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>{editando ? 'Editar Empleado' : 'Nuevo Empleado'}</strong>
      </CCardHeader>

      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          {/* NOMBRES / APELLIDOS */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="Nombres"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Apellidos"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                required
              />
            </CCol>
          </CRow>

          {/* CI / TELÉFONO */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="CI / Documento"
                name="ci_doc"
                value={form.ci_doc}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Teléfono / Celular"
                name="telf_cel"
                value={form.telf_cel}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          {/* SUCURSAL / SUELDO */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormSelect
                label="Sucursal"
                name="sucursal_id"
                value={form.sucursal_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione sucursal</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ciudad} - {s.nombre} ({s.codigo_sucursal})
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Sueldo"
                type="number"
                name="sueldo"
                value={form.sueldo}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </CCol>
          </CRow>

          {/* SWITCHES */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormSwitch
                label="En planilla"
                name="en_planilla"
                checked={form.en_planilla}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormSwitch
                label="Empleado activo"
                name="estado"
                checked={form.estado}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormSwitch
                label="Tiene acceso al sistema"
                checked={tieneUsuario}
                onChange={(e) => {
                  const checked = e.target.checked
                  setTieneUsuario(checked)

                  if (!checked) {
                    setForm((prev) => ({
                      ...prev,
                      usuario_id: '',
                    }))
                  }
                }}
              />
            </CCol>
          </CRow>

          {/* USUARIO */}
          {tieneUsuario && (
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormSelect
                  label="Usuario del sistema"
                  name="usuario_id"
                  value={form.usuario_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione usuario</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          )}
          <CRow className="mt-4">
            <CCol className="d-flex justify-content-between">
              <CButton
                type="button"
                color="secondary"
                variant="outline"
                onClick={() => navigate('/empleados')}
              >
                Cancelar
              </CButton>

              <CButton type="submit" color="primary">
                {editando ? 'Actualizar Empleado' : 'Guardar Empleado'}
              </CButton>
            </CCol>
          </CRow>

          {/* <CButton type="submit" color="primary">
            {editando ? 'Actualizar Empleado' : 'Guardar Empleado'}
          </CButton> */}
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default EmpleadoForm
