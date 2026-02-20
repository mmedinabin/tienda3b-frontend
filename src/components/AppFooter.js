import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  const year = new Date().getFullYear()

  return (
    <CFooter
      className="px-4 text-center"
      style={{
        borderTop: '1px solid #e9ecef',
        color: '#495057',
        fontSize: '0.9rem',
      }}
    >
      <div>
        © {year} ·{' '}
        Desarrollado por <strong>Tienda 3B Valles Cruceños</strong>
        {/* <strong>Tienda 3B Valles Cruceños</strong> */}
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)

