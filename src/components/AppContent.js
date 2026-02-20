import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

import routes from '../routes'
import ProtectedRoute from '../components/ProtectedRoute'

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  element={
                    route.modulo ? (
                      <ProtectedRoute modulo={route.modulo} accion={route.accion}>
                        <route.element />
                      </ProtectedRoute>
                    ) : (
                      <route.element />
                    )
                  }
                />
              )
            )
          })}
        </Routes>
      </Suspense>
    </CContainer>
  )
}

// const AppContent = () => {
//   return (
//     <CContainer className="px-4" lg>
//       <Suspense fallback={<CSpinner color="primary" />}>
//         <Routes>
//           {routes.map((route, idx) => {
//             return (
//               route.element && (
//                 <Route
//                   key={idx}
//                   path={route.path}
//                   element={<route.element />}
//                 />
//               )
//             )
//           })}
//         </Routes>
//       </Suspense>
//     </CContainer>
//   )
// }

export default React.memo(AppContent)
