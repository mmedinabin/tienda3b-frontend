import React, { useState } from 'react'
import {
  CRow,
  CCol,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormCheck,
  CBadge,
  CFormInput,
  CFormSelect,
  CCollapse,
} from '@coreui/react'

import { ventasService } from '../../services/ventas.service'

export default function NuevaDistribucion() {
  const [ventas, setVentas] = useState([])
  const [seleccionadas, setSeleccionadas] = useState([])
  const [consolidado, setConsolidado] = useState([])
  const [equivalencias, setEquivalencias] = useState({})
  const [tipoBusqueda, setTipoBusqueda] = useState('HOY')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [openRows, setOpenRows] = useState({})

  // =========================
  // Buscar ventas
  // =========================

  const buscarVentas = async () => {
    const res = await ventasService.listar()
    console.log(res.data)

    let lista = res.data.data.filter((v) => v.estado === 'ACTIVA')

    if (tipoBusqueda === 'HOY') {
      const hoy = new Date().toISOString().slice(0, 10)

      lista = lista.filter((v) => v.fecha.slice(0, 10) === hoy)
    }

    if (tipoBusqueda === 'RANGO') {
      if (!fechaInicio || !fechaFin) {
        alert('Seleccione rango de fechas')
        return
      }

      lista = lista.filter((v) => {
        const fecha = v.fecha.slice(0, 10)

        return fecha >= fechaInicio && fecha <= fechaFin
      })
    }

    setVentas(lista)
    setSeleccionadas([])
    setConsolidado([])
  }

  // =========================
  // seleccionar venta
  // =========================

  const toggleVenta = (venta) => {
    const existe = seleccionadas.some((v) => v.id === venta.id)

    if (existe) {
      setSeleccionadas(seleccionadas.filter((v) => v.id !== venta.id))
    } else {
      setSeleccionadas([...seleccionadas, venta])
    }
  }

  const toggleSeleccionarTodas = () => {
    if (seleccionadas.length === ventas.length) {
      setSeleccionadas([])
    } else {
      setSeleccionadas(ventas)
    }
  }

  // =========================
  // collapse detalle
  // =========================

  const toggleDetalle = (id) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // =========================
  // generar consolidado
  // =========================

  const generarConsolidado = () => {
    if (seleccionadas.length === 0) {
      alert('Seleccione ventas')
      return
    }

    const mapa = {}

    seleccionadas.forEach((v) => {
      v.productos.forEach((p) => {
        if (!mapa[p.producto]) {
          mapa[p.producto] = {
            nombre: p.producto,
            total: 0,
          }
        }

        mapa[p.producto].total += Number(p.cantidad)
      })
    })

    setConsolidado(Object.values(mapa))
  }

  // =========================
  // equivalencias
  // =========================

  const setEq = (producto, valor) => {
    setEquivalencias((prev) => ({
      ...prev,
      [producto]: Number(valor),
    }))
  }

  // const calcular = (producto, total) => {
  //   const eq = equivalencias[producto]

  //   if (!eq || eq <= 0) {
  //     return { cajas: '-', unidades: total }
  //   }

  //   const cajas = Math.floor(total / eq)
  //   const unidades = total % eq

  //   return { cajas, unidades }
  // }

  const calcular = (producto, total) => {
    const eq = equivalencias[producto]

    if (!eq || eq <= 0) {
      return {
        cajas: '-',
        unidades: total,
        cajasTexto: '-',
      }
    }

    const cajas = Math.floor(total / eq)
    const unidades = total % eq

    return {
      cajas,
      unidades,
      cajasTexto: `${cajas} (${eq} unid)`,
    }
  }

  // =========================
  // imprimir
  // =========================

  const imprimir = () => {
    const fecha = new Date()

    const fechaUTC4 = new Date(fecha.getTime() - 4 * 60 * 60 * 1000)

    const fechaTexto = fechaUTC4.toISOString().slice(0, 19).replace('T', ' ')

    // clonamos la tabla
    const tabla = document.getElementById('tablaConsolidado').cloneNode(true)

    const filas = tabla.querySelectorAll('tbody tr')

    filas.forEach((fila) => {
      const producto = fila.children[1].innerText
      const cajas = fila.children[4].innerText

      const eq = equivalencias[producto]

      if (eq && eq > 0 && cajas !== '-') {
        fila.children[4].innerText = `${cajas} (${eq} unid)`
      }
    })

    const contenido = tabla.outerHTML

    const ventana = window.open('', 'PRINT', 'height=700,width=900')

    ventana.document.write(`
<html>
<head>
<title>Distribución</title>

<style>
body{font-family:Arial}
table{width:100%;border-collapse:collapse}
th{
  border:1px solid #ccc;
  padding:6px;
  text-align:center;
  background:#f2f2f2;
  font-weight:bold;
}

td{
  border:1px solid #ccc;
  padding:6px;
  text-align:center;
}
h3{text-align:center}

.fecha{
text-align:left;
font-size:12px;
margin-bottom:10px;
}

@media print {
.no-print{
display:none;
}
}

</style>

</head>

<body>

<h3>Hoja de Distribución</h3>

<div class="fecha">
Fecha impresión: ${fechaTexto}
</div>

${contenido}

</body>
</html>
`)

    ventana.document.close()
    ventana.print()
  }

  return (
    <>
      {/* BUSQUEDA */}

      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>Nueva Distribución / Ventas</CCardHeader>

            <CCardBody>
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormSelect
                    value={tipoBusqueda}
                    onChange={(e) => setTipoBusqueda(e.target.value)}
                  >
                    <option value="HOY">Hoy</option>
                    <option value="RANGO">Entre fechas</option>
                  </CFormSelect>
                </CCol>

                {tipoBusqueda === 'RANGO' && (
                  <>
                    <CCol md={3}>
                      <CFormInput
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                      />
                    </CCol>

                    <CCol md={3}>
                      <CFormInput
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                      />
                    </CCol>
                  </>
                )}

                <CCol md={2}>
                  <CButton color="primary" onClick={buscarVentas}>
                    Buscar
                  </CButton>
                </CCol>
              </CRow>

              {/* TABLA */}

              <CTable hover striped responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>

                    <CTableHeaderCell>
                      <CFormCheck
                        checked={ventas.length > 0 && seleccionadas.length === ventas.length}
                        onChange={toggleSeleccionarTodas}
                      />
                    </CTableHeaderCell>

                    <CTableHeaderCell>Código</CTableHeaderCell>
                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                    <CTableHeaderCell>Cliente</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell>Producto/s</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {ventas.map((v, index) => (
                    <React.Fragment key={v.id}>
                      <CTableRow
                        style={{
                          background: openRows[v.id] ? '#eef5ff' : 'transparent',
                        }}
                      >
                        <CTableDataCell>{index + 1}</CTableDataCell>

                        <CTableDataCell>
                          <CFormCheck
                            checked={seleccionadas.some((s) => s.id === v.id)}
                            onChange={() => toggleVenta(v)}
                          />
                        </CTableDataCell>

                        <CTableDataCell>
                          <strong>{v.codigo}</strong>
                        </CTableDataCell>

                        <CTableDataCell>{new Date(v.fecha).toLocaleString()}</CTableDataCell>

                        <CTableDataCell>{v.cliente}</CTableDataCell>

                        <CTableDataCell>Bs {v.total}</CTableDataCell>

                        <CTableDataCell>
                          {v.estado === 'ACTIVA' ? (
                            <CBadge color="success">Activa</CBadge>
                          ) : (
                            <CBadge color="danger">Anulada</CBadge>
                          )}
                        </CTableDataCell>

                        <CTableDataCell>
                          {v.productos.length === 1 ? (
                            <span style={{ fontSize: '0.85rem' }}>
                              {v.productos[0].producto} ({v.productos[0].cantidad} Unid)
                            </span>
                          ) : (
                            <CButton
                              size="sm"
                              color="info"
                              variant="outline"
                              onClick={() => toggleDetalle(v.id)}
                            >
                              {openRows[v.id] ? '▲ Ocultar' : '▼ Detalle'}
                            </CButton>
                          )}
                        </CTableDataCell>
                      </CTableRow>

                      {v.productos.length > 1 && (
                        <CTableRow>
                          <CTableDataCell colSpan={8} className="p-0">
                            <CCollapse visible={openRows[v.id]}>
                              <div
                                style={{
                                  padding: '15px 35px',
                                  background: '#f8f9fa',
                                  borderLeft: '5px solid #0d6efd',
                                  borderTop: '1px solid #dee2e6',
                                }}
                              >
                                <div
                                  style={{
                                    marginBottom: '10px',
                                    fontWeight: 'bold',
                                    color: '#0d6efd',
                                  }}
                                >
                                  Detalle de Venta #{v.id} — {v.cliente}
                                </div>

                                <CTable
                                  small
                                  bordered
                                  hover
                                  style={{
                                    fontSize: '0.85rem',
                                    tableLayout: 'fixed',
                                    width: '100%',
                                  }}
                                >
                                  <CTableHead>
                                    <CTableRow>
                                      <CTableHeaderCell style={{ width: '50px' }}>
                                        #
                                      </CTableHeaderCell>

                                      <CTableHeaderCell>Producto</CTableHeaderCell>

                                      <CTableHeaderCell style={{ width: '110px' }}>
                                        Cantidad
                                      </CTableHeaderCell>

                                      <CTableHeaderCell style={{ width: '120px' }}>
                                        Precio
                                      </CTableHeaderCell>

                                      <CTableHeaderCell style={{ width: '130px' }}>
                                        Subtotal
                                      </CTableHeaderCell>
                                    </CTableRow>
                                  </CTableHead>

                                  <CTableBody>
                                    {v.productos.map((p, i) => (
                                      <CTableRow key={i}>
                                        <CTableDataCell>{i + 1}</CTableDataCell>

                                        <CTableDataCell
                                          style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                          title={p.producto}
                                        >
                                          {p.producto}
                                        </CTableDataCell>

                                        <CTableDataCell>{p.cantidad}</CTableDataCell>

                                        <CTableDataCell>Bs {p.precio_unitario}</CTableDataCell>

                                        <CTableDataCell>Bs {p.subtotal}</CTableDataCell>
                                      </CTableRow>
                                    ))}
                                  </CTableBody>
                                </CTable>
                              </div>
                            </CCollapse>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </React.Fragment>
                  ))}
                </CTableBody>
              </CTable>

              <div className="text-end">
                <CButton
                  color="success"
                  onClick={generarConsolidado}
                  disabled={seleccionadas.length === 0}
                  className="ms-2"
                >
                  Generar Consolidado
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* CONSOLIDADO */}

      {consolidado.length > 0 && (
        <CCard className="mt-4">
          <CCardHeader>Consolidado de Productos</CCardHeader>

          <CCardBody>
            <div id="tablaConsolidado">
              <CTable striped>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Producto</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell className="no-print">
                      Cant x Caja/Paquet/Otro
                    </CTableHeaderCell>
                    <CTableHeaderCell>Cajas</CTableHeaderCell>
                    <CTableHeaderCell>Unidades</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {consolidado.map((p, i) => {
                    const r = calcular(p.nombre, p.total)

                    return (
                      <CTableRow key={i}>
                        <CTableDataCell>{i + 1}</CTableDataCell>

                        <CTableDataCell>{p.nombre}</CTableDataCell>

                        <CTableDataCell>{p.total}</CTableDataCell>

                        <CTableDataCell className="no-print">
                          <CFormInput
                            type="number"
                            placeholder="0"
                            style={{ width: '80px' }}
                            onChange={(e) => setEq(p.nombre, e.target.value)}
                          />
                        </CTableDataCell>

                        <CTableDataCell>{r.cajas}</CTableDataCell>

                        <CTableDataCell>{r.unidades}</CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>

            <div className="text-end">
              <CButton color="dark" className="mt-3" onClick={imprimir}>
                Imprimir Hoja
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      )}
    </>
  )
}
