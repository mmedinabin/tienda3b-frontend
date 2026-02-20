import React from 'react'
import { CContainer, CRow, CCol, CCard, CCardBody } from '@coreui/react'

const NoAutorizado = () => {
  return (
    <CContainer className="mt-5">
      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard>
            <CCardBody className="text-center">
              <h1 className="display-4 text-danger">403</h1>
              <h4>Acceso denegado</h4>
              <p>No tienes permisos para acceder a este módulo.</p>
              <p>Comunícate con el administrador.</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default NoAutorizado