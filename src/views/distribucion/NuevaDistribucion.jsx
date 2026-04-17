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
  // 🔥 HELPERS UTC-4
  // =========================

  const OFFSET = -4

  const toUTC4Date = (fecha) => {
    const f = new Date(fecha)
    return new Date(f.getTime() + OFFSET * 60 * 60 * 1000)
  }

  const toUTC4DateString = (fecha) => {
    return toUTC4Date(fecha).toISOString().slice(0, 10)
  }

  // =========================
  // Buscar ventas
  // =========================

  const buscarVentas = async () => {
    const res = await ventasService.listar()

    let lista = res.data.data.filter((v) => v.estado === 'ACTIVA')

    // ✅ HOY UTC-4 CORRECTO
    if (tipoBusqueda === 'HOY') {
      const hoyLocal = toUTC4DateString(new Date())

      lista = lista.filter((v) => {
        return toUTC4DateString(v.fecha) === hoyLocal
      })
    }

    // ✅ RANGO UTC-4 CORRECTO
    if (tipoBusqueda === 'RANGO') {
      if (!fechaInicio || !fechaFin) {
        alert('Seleccione rango de fechas')
        return
      }

      lista = lista.filter((v) => {
        const fecha = toUTC4DateString(v.fecha)
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

    const fechaUTC4 = toUTC4Date(fecha)

    const fechaTexto = fechaUTC4.toISOString().slice(0, 19).replace('T', ' ')

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
                      <CTableRow>
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

                        {/* <CTableDataCell>
                          {toUTC4Date(v.fecha).toLocaleString()}
                        </CTableDataCell> */}
                        <CTableDataCell>
                          {new Date(v.fecha).toLocaleString('es-BO', {
                            timeZone: 'America/La_Paz',
                            hour12: false,
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CTableDataCell>

                        <CTableDataCell>{v.cliente}</CTableDataCell>

                        <CTableDataCell>Bs {v.total}</CTableDataCell>

                        <CTableDataCell>
                          <CBadge color="success">Activa</CBadge>
                        </CTableDataCell>

                        <CTableDataCell>...</CTableDataCell>
                      </CTableRow>
                    </React.Fragment>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}
