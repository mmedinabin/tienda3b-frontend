import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react'
import comprasService from '../services/compras.service'
//import ventasService from '../services/ventas.service'

const DocumentoViewer = ({ tipo, id }) => {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDocumento = async () => {
      try {
        setCargando(true)

        let response

        if (tipo === 'COMPRA') {
          response = await comprasService.obtener(id)
        } else {
          response = await ventasService.obtener(id)
        }

        setData(response.data)
      } catch (error) {
        console.error('Error cargando documento')
      } finally {
        setCargando(false)
      }
    }

    cargarDocumento()
  }, [tipo, id])

  const imprimir = () => {
    window.print()
  }

  if (cargando) {
    return (
      <div className="text-center p-5">
        <CSpinner />
      </div>
    )
  }

  if (!data) {
    return <div className="p-4 text-danger">Documento no encontrado</div>
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <h4>{tipo}</h4>

        <div className="d-flex gap-2">
          <CButton color="secondary" onClick={imprimir}>
            🖨 Imprimir
          </CButton>

          <CButton
            color="primary"
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_API_URL}/api/documentos/${tipo.toLowerCase()}/${id}`,
                '_blank',
              )
            }
          >
            📥 Descargar PDF
          </CButton>
        </div>
      </div>

      <CCard className="shadow-sm">
        <CCardBody id="documento-print">

          {/* ================= CABECERA ================= */}
          <CRow className="mb-4">
            <CCol md={6}>
              <h5><strong>{tipo}</strong></h5>
              <div><strong>Código:</strong> {data.cabecera.codigo}</div>
              <div><strong>Fecha:</strong> {new Date(data.cabecera.fecha).toLocaleDateString()}</div>
              <div>
                <strong>
                  {tipo === 'COMPRA' ? 'Proveedor' : 'Cliente'}:
                </strong>{' '}
                {data.cabecera.tercero}
              </div>
              <div><strong>Tipo pago:</strong> {data.cabecera.tipo_pago}</div>
            </CCol>
          </CRow>

          {/* ================= DETALLE ================= */}
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>{tipo === 'COMPRA' ? 'Costo' : 'Precio'}</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {data.detalle.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td>
                    {Number(
                      tipo === 'COMPRA'
                        ? item.costo_unitario
                        : item.precio_unitario,
                    ).toFixed(2)}
                  </td>
                  <td>
                    {Number(
                      tipo === 'COMPRA'
                        ? item.costo_subtotal
                        : item.subtotal,
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ================= TOTALES ================= */}
          <div className="text-end mt-4">
            <h5>Total: Bs {Number(data.cabecera.total).toFixed(2)}</h5>
            <h6>Saldo: Bs {Number(data.cabecera.saldo).toFixed(2)}</h6>
          </div>

        </CCardBody>
      </CCard>

      {/* ================= PRINT STYLE ================= */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }

            body {
              background: white !important;
            }

            .card {
              border: none !important;
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </>
  )
}

export default DocumentoViewer
