import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

import { loginRequest, getPerfil } from '../../../api/auth.service'
import { useAuthStore } from '../../../store/auth.store'
import logo from '../../../assets/images/login3.webp'
import InstallPWA from '../../../components/InstallPWA'

const Login = () => {
  const navigate = useNavigate()
  const auth = useAuthStore()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const data = await loginRequest(loginValue, password)
      auth.login({ token: data.token })
      const perfil = await getPerfil()
      auth.setPerfil(perfil.user, perfil.permisos)
      navigate('/')
    } catch (err) {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        padding: '20px',
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={10} lg={8}>
            <CCardGroup className="shadow-lg rounded-4 overflow-hidden">
              {/* 🔹 CARD LOGIN */}
              <CCard className="border-0 p-4 p-md-5">
                <CCardBody>
                  {/* Logo SOLO mobile */}
                  <div className="text-center d-md-none mb-4">
                    <img src={logo} alt="Logo" style={{ width: '170px' }} />
                  </div>

                  <h2 className="fw-bold mb-2">Iniciar session</h2>
                  <p className="text-body-secondary mb-4">Ingrese a su cuenta</p>

                  {error && <CAlert color="danger">{error}</CAlert>}

                  <CForm onSubmit={handleSubmit}>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        size="lg"
                        placeholder="Email o Usuario"
                        value={loginValue}
                        onChange={(e) => setLoginValue(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        size="lg"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <CButton
                      type="submit"
                      size="lg"
                      className="w-100"
                      style={{
                        background: '#4f46e5',
                        border: 'none',
                      }}
                    >
                      Ingresar
                    </CButton>
                  </CForm>
                  <InstallPWA />
                </CCardBody>
              </CCard>

              {/* 🔹 PANEL DERECHO SOLO DESKTOP */}
              <CCard
                className="d-none d-md-flex border-0 text-white"
                style={{
                  width: '50%',
                  background: 'linear-gradient(135deg, #526788, #c9d5e6)',
                }}
              >
                <CCardBody className="d-flex justify-content-center align-items-center p-5">
                  <img
                    src={logo}
                    alt="Logo"
                    style={{
                      width: '80%',
                      maxWidth: '450px',
                      objectFit: 'contain',
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
