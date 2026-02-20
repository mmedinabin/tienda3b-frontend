import React from 'react'
import {
  CToast,
  CToastBody,
  CToastHeader,
} from '@coreui/react'

const AppToast = ({ title = 'Sistema', message, color = 'success' }) => {
  return (
    <CToast color={color} autohide delay={3000}>
      <CToastHeader closeButton>
        <strong className="me-auto">{title}</strong>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )
}

export default AppToast
