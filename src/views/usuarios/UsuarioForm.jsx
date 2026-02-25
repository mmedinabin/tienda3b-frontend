import React, { useEffect, useState, useMemo } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CRow,
  CCol,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { usuariosService } from '../../services/usuarios.service'
import api from '../../api/api'

const UsuarioForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = !!id

  const [roles, setRoles] = useState([])
  const [sucursales, setSucursales] = useState([])

  const [form, setForm] = useState({
    username: '',
    email: '',
    nombre: '',
    password: '',
    rol_id: '',
    sucursal_id: '',
    estado: true,
  })

  /* =========================
     CARGA INICIAL
  ========================= */
  useEffect(() => {
    api.get('/roles').then((res) => setRoles(res.data))
    api.get('/sucursales').then((res) => setSucursales(res.data))

    if (editando) {
      usuariosService.obtener(id).then((res) => {
        setForm({ ...res.data, password: '' })
      })
    }
  }, [])

  /* =========================
     DETECTAR ROL ADMIN
  ========================= */
  const rolSeleccionado = useMemo(() => {
    return roles.find((r) => r.id === form.rol_id)
  }, [roles, form.rol_id])

  const esAdmin = rolSeleccionado?.nombre === 'ADMIN'

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    let newValue = value

    if (type === 'checkbox') newValue = checked

    if (name === 'rol_id') {
      newValue = Number(value)

      const rol = roles.find((r) => r.id === newValue)

      if (rol?.nombre !== 'ADMIN') {
        setForm((prev) => ({
          ...prev,
          rol_id: newValue,
          sucursal_id: '',
        }))
        return
      }
    }

    if (name === 'sucursal_id') {
      newValue = value === '' ? '' : Number(value)
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

    if (!esAdmin && !form.sucursal_id) {
      alert('Debe seleccionar una sucursal')
      return
    }

    if (editando) {
      await usuariosService.actualizar(id, form)
    } else {
      await usuariosService.crear(form)
    }

    navigate('/usuarios')
  }

  // return (
  //   <CCard>
  //     <CCardHeader>
  //       <strong>{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</strong>
  //     </CCardHeader>

  //     <CCardBody>
  //       <CForm onSubmit={handleSubmit}>
  //         <CFormInput
  //           label="Username"
  //           name="username"
  //           value={form.username}
  //           onChange={handleChange}
  //           disabled={editando}
  //           required
  //         />

  //         <CFormInput
  //           label="Email"
  //           name="email"
  //           value={form.email}
  //           onChange={handleChange}
  //           disabled={editando}
  //           required
  //         />

  //         <CFormInput
  //           label="Nombre"
  //           name="nombre"
  //           value={form.nombre}
  //           onChange={handleChange}
  //           required
  //         />

  //         {!editando && (
  //           <CFormInput
  //             label="Password"
  //             name="password"
  //             type="password"
  //             value={form.password}
  //             onChange={handleChange}
  //             required
  //           />
  //         )}

  //         {/* ROL */}
  //         <CFormSelect
  //           label="Rol"
  //           name="rol_id"
  //           value={form.rol_id}
  //           onChange={handleChange}
  //           required
  //         >
  //           <option value="">Seleccione un rol</option>
  //           {roles.map((r) => (
  //             <option key={r.id} value={r.id}>
  //               {r.nombre}
  //             </option>
  //           ))}
  //         </CFormSelect>

  //         {/* SUCURSAL */}

  //         <CFormSelect
  //           label="Sucursal"
  //           name="sucursal_id"
  //           value={form.sucursal_id ?? ''}
  //           onChange={handleChange}
  //           required={!esAdmin}
  //         >
  //           <option value="">Seleccione una sucursal</option>

  //           {esAdmin && <option value="">Modo Global (solo ADMIN)</option>}

  //           {sucursales.map((s) => (
  //             <option key={s.id} value={s.id}>
  //               [{s.codigo_sucursal}] {s.ciudad} - {s.nombre}
  //             </option>
  //           ))}
  //         </CFormSelect>

  //         {editando && (
  //           <CFormSwitch
  //             label="Activo"
  //             name="estado"
  //             checked={form.estado}
  //             onChange={handleChange}
  //             className="mt-3"
  //           />
  //         )}

  //         {/* BOTONES */}
  //         <CRow className="mt-4">
  //           <CCol className="d-flex justify-content-between">
  //             <CButton
  //               type="button"
  //               color="secondary"
  //               variant="outline"
  //               onClick={() => navigate('/usuarios')}
  //             >
  //               Cancelar
  //             </CButton>

  //             <CButton color="primary" type="submit">
  //               Guardar
  //             </CButton>
  //           </CCol>
  //         </CRow>
  //       </CForm>
  //     </CCardBody>
  //   </CCard>
  // )

  return (
    <CCard className="shadow-sm border-0" style={{ borderRadius: 16 }}>
      <CCardHeader className="bg-white border-0 pb-0">
        <h5 className="fw-semibold mb-0">{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
        <small className="text-muted">Complete la información del usuario</small>
      </CCardHeader>

      <CCardBody className="pt-3">
        <CForm onSubmit={handleSubmit}>
          <CRow className="g-3">
            {/* Username */}
            <CCol md={6}>
              <CFormInput
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled={editando}
                required
              />
            </CCol>

            {/* Email */}
            <CCol md={6}>
              <CFormInput
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={editando}
                required
              />
            </CCol>

            {/* Nombre */}
            <CCol md={6}>
              <CFormInput
                label="Nombre completo"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </CCol>

            {/* Password */}
            {!editando && (
              <CCol md={6}>
                <CFormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </CCol>
            )}

            {/* Rol */}
            <CCol md={6}>
              <CFormSelect
                label="Rol"
                name="rol_id"
                value={form.rol_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un rol</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Sucursal */}
            <CCol md={6}>
              <CFormSelect
                label="Sucursal"
                name="sucursal_id"
                value={form.sucursal_id ?? ''}
                onChange={handleChange}
                required={!esAdmin}
              >
                <option value="">Seleccione una sucursal</option>

                {esAdmin && <option value="">Modo Global (solo ADMIN)</option>}

                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.codigo_sucursal}] {s.ciudad} - {s.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Estado */}
            {editando && (
              <CCol md={6} className="d-flex align-items-center mt-2">
                <CFormSwitch
                  label="Usuario activo"
                  name="estado"
                  checked={form.estado}
                  onChange={handleChange}
                />
              </CCol>
            )}
          </CRow>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <CButton
              type="button"
              color="secondary"
              variant="outline"
              onClick={() => navigate('/usuarios')}
            >
              Cancelar
            </CButton>

            <CButton color="primary" type="submit">
              Guardar usuario
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default UsuarioForm
