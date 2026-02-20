import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { CCard, CCardBody, CButton, CRow, CCol, CFormSelect, CSpinner } from '@coreui/react'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import * as XLSX from 'xlsx-js-style'

import SmartTable from '../../components/SmartTable'
import stockService from '../../services/stock.service'
import { sucursalesService } from '../../services/sucursales.service'

const StockInventario = () => {
  const [sucursales, setSucursales] = useState([])
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('')
  const [stock, setStock] = useState([])
  const [cargando, setCargando] = useState(false)
  const [consultado, setConsultado] = useState(false)

  const obtenerNombreSucursal = () => {
    const suc = sucursales.find((s) => s.id == sucursalSeleccionada)
    return suc ? `${suc.ciudad} - ${suc.codigo_sucursal}` : ''
  }
  /* ================= CARGAR SUCURSALES ================= */
  useEffect(() => {
    const cargarSucursales = async () => {
      const { data } = await sucursalesService.listar()
      setSucursales(data)
    }
    cargarSucursales()
  }, [])

  /* ================= CONSULTAR STOCK ================= */
  const consultarStock = async () => {
    if (!sucursalSeleccionada) {
      return Swal.fire({
        icon: 'warning',
        title: 'Seleccione una sucursal',
      })
    }

    try {
      setCargando(true)

      const { data } = await stockService.listar(sucursalSeleccionada)

      setStock(data)
      setConsultado(true)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al consultar stock',
      })
    } finally {
      setCargando(false)
    }
  }
  const totalCosto = stock.reduce((acc, item) => acc + Number(item.costo_total), 0)
  const totalValorizado = stock.reduce((acc, item) => acc + Number(item.total_venta_realizable), 0)

  const exportarExcel = () => {
    if (!stock.length) return

    const ahora = new Date()
    const fechaHora = ahora.toLocaleString()
    const nombreSucursal = obtenerNombreSucursal()

    /* ================= 1️⃣ PREPARAR DATOS ================= */

    const dataExport = stock.map((item, index) => {
      const cantidad = Number(item.cantidad)

      const costoUnitario = cantidad > 0 ? Number(item.costo_total) / cantidad : 0

      const margenUnitario = Number(item.precio_venta) - costoUnitario

      const margenPorcentaje = costoUnitario > 0 ? margenUnitario / costoUnitario : 0

      return {
        '#': index + 1, // 🔵 CONTADOR AUTOMÁTICO
        Codigo: item.codigo,
        Producto: item.nombre,
        Cantidad: cantidad,
        CostoUnitario: costoUnitario,
        CostoTotal: Number(item.costo_total),
        PrecioVenta: Number(item.precio_venta),
        TotalVenta: Number(item.total_venta_realizable),
        MargenUnitario: margenUnitario,
        MargenPorcentaje: margenPorcentaje,
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataExport, { origin: 'A6' })
    const range = XLSX.utils.decode_range(worksheet['!ref'])

    /* ================= 2️⃣ TÍTULO PRINCIPAL ================= */

    worksheet['A1'] = {
      v: 'REPORTE DE SISTEMA',
      s: {
        font: { bold: true, sz: 16 },
      },
    }

    worksheet['A2'] = {
      v: `Fecha y hora: ${fechaHora}`,
    }

    worksheet['A3'] = {
      v: `Sucursal: ${nombreSucursal}`,
      s: {
        font: { bold: true },
      },
    }

    /* ================= 3️⃣ ESTILO HEADER ================= */

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 5, c: col }) // fila 6 (index 5)

      if (!worksheet[cellAddress]) continue

      worksheet[cellAddress].s = {
        font: {
          bold: true,
          color: { rgb: 'FFFFFF' },
        },
        fill: {
          patternType: 'solid',
          fgColor: { rgb: '343A40' },
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        },
      }
    }

    /* ================= 4️⃣ FORMATO NUMÉRICO ================= */

    for (let row = 6; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = worksheet[cellAddress]
        if (!cell) continue

        if (col >= 3) {
          cell.t = 'n'

          if (col === 9) {
            cell.z = '0.00%'
          } else if (col === 3) {
            cell.z = '0'
          } else {
            cell.z = '#,##0.00'
          }

          cell.s = {
            alignment: { horizontal: 'right' },
          }
        }
      }
    }

    /* ================= 5️⃣ ANCHO COLUMNAS ================= */

    worksheet['!cols'] = [
      { wch: 6 }, // #
      { wch: 12 }, // Codigo
      { wch: 30 }, // Producto
      { wch: 10 }, // Cantidad
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock')

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    })

    saveAs(blob, 'reporte_stock.xlsx')
  }

const exportarPDF = () => {
  if (!stock.length) return

  const doc = new jsPDF({ orientation: "landscape" }) // 🔵 mejor horizontal

  const ahora = new Date()
  const fechaHora = ahora.toLocaleString()
  const nombreSucursal = obtenerNombreSucursal()

  const fechaFormateada =
    ahora.getFullYear() +
    '-' +
    String(ahora.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(ahora.getDate()).padStart(2, '0') +
    '_' +
    String(ahora.getHours()).padStart(2, '0') +
    '-' +
    String(ahora.getMinutes()).padStart(2, '0')

  /* ================= 1️⃣ TITULOS ================= */

  doc.setFontSize(16)
  doc.setFont(undefined, "bold")
  doc.text("REPORTE DE SISTEMA", 14, 15)

  doc.setFontSize(12)
  doc.setFont(undefined, "normal")
  doc.text("Reporte de Stock Inventario", 14, 22)

  doc.setFontSize(10)
  doc.text(`Fecha y hora: ${fechaHora}`, 14, 28)
  doc.text(`Sucursal: ${nombreSucursal}`, 14, 33)

  /* ================= 2️⃣ DATOS TABLA ================= */

  const tableData = stock.map((item, index) => {
    const cantidad = Number(item.cantidad)

    const costoUnitario =
      cantidad > 0 ? Number(item.costo_total) / cantidad : 0

    const margenUnitario = Number(item.precio_venta) - costoUnitario

    const margenPorcentaje =
      costoUnitario > 0 ? (margenUnitario / costoUnitario) * 100 : 0

    return [
      index + 1, // 🔵 numeración automática
      item.codigo,
      item.nombre,
      cantidad,
      costoUnitario.toFixed(2),
      Number(item.costo_total).toFixed(2),
      Number(item.precio_venta).toFixed(2),
      Number(item.total_venta_realizable).toFixed(2),
      margenUnitario.toFixed(2),
      margenPorcentaje.toFixed(2) + '%',
    ]
  })

  /* ================= 3️⃣ TABLA ================= */

  autoTable(doc, {
    startY: 40,
    head: [[
      '#',
      'Código',
      'Producto',
      'Cant',
      'Costo U',
      'Costo Total',
      'P.Venta',
      'Total Venta',
      'Margen U',
      '% Margen',
    ]],
    body: tableData,
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [52, 58, 64],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right' },
      9: { halign: 'right' },
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(9)
      doc.text(
        `Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pageCount}`,
        doc.internal.pageSize.width - 40,
        doc.internal.pageSize.height - 10
      )
    },
  })

  /* ================= 4️⃣ TOTALES ================= */

  const totalCosto = stock.reduce(
    (acc, item) => acc + Number(item.costo_total),
    0
  )

  const totalValorizado = stock.reduce(
    (acc, item) => acc + Number(item.total_venta_realizable),
    0
  )

  const finalY = doc.lastAutoTable.finalY + 10

  doc.setFont(undefined, "bold")
  doc.text(
    `Costo Total Inventario: Bs ${totalCosto.toFixed(2)}`,
    14,
    finalY
  )

  doc.text(
    `Total Valorizado Venta: Bs ${totalValorizado.toFixed(2)}`,
    14,
    finalY + 6
  )

  /* ================= 5️⃣ GUARDAR ================= */

  doc.save(`reporte_stock_${fechaFormateada}.pdf`)
}



  // const exportarPDF = () => {
  //   if (!stock.length) return

  //   const doc = new jsPDF()

  //   const ahora = new Date()

  //   const fechaFormateada =
  //     ahora.getFullYear() +
  //     '-' +
  //     String(ahora.getMonth() + 1).padStart(2, '0') +
  //     '-' +
  //     String(ahora.getDate()).padStart(2, '0') +
  //     '_' +
  //     String(ahora.getHours()).padStart(2, '0') +
  //     '-' +
  //     String(ahora.getMinutes()).padStart(2, '0')

  //   doc.setFontSize(14)
  //   doc.text('Stock Inventario', 14, 15)

  //   doc.setFontSize(10)
  //   doc.text(`Fecha: ${ahora.toLocaleString()}`, 14, 22)

  //   const tableData = stock.map((item) => {
  //     const cantidad = Number(item.cantidad)

  //     const costoUnitario = cantidad > 0 ? Number(item.costo_total) / cantidad : 0

  //     const margenUnitario = Number(item.precio_venta) - costoUnitario

  //     const margenPorcentaje = costoUnitario > 0 ? (margenUnitario / costoUnitario) * 100 : 0

  //     return [
  //       item.codigo,
  //       item.nombre,
  //       cantidad,
  //       costoUnitario.toFixed(2),
  //       Number(item.costo_total).toFixed(2),
  //       Number(item.precio_venta).toFixed(2),
  //       Number(item.total_venta_realizable).toFixed(2),
  //       margenUnitario.toFixed(2),
  //       margenPorcentaje.toFixed(2) + '%',
  //     ]
  //   })

  //   autoTable(doc, {
  //     startY: 28,
  //     head: [
  //       [
  //         'Código',
  //         'Producto',
  //         'Cant',
  //         'Costo U',
  //         'Costo Total',
  //         'P.Venta',
  //         'Total Venta',
  //         'Margen U',
  //         '% Margen',
  //       ],
  //     ],
  //     body: tableData,
  //     styles: {
  //       fontSize: 8,
  //     },
  //     headStyles: {
  //       fillColor: [52, 58, 64],
  //     },
  //     columnStyles: {
  //       2: { halign: 'right' },
  //       3: { halign: 'right' },
  //       4: { halign: 'right' },
  //       5: { halign: 'right' },
  //       6: { halign: 'right' },
  //       7: { halign: 'right' },
  //       8: { halign: 'right' },
  //     },
  //   })

  //   doc.save(`stock_inventario_${fechaFormateada}.pdf`)
  // }

  const columns = [
    { key: 'codigo', label: 'Cod Prod', hideOnMobile: true },

    {
      key: 'nombre',
      label: 'Producto / Descrip.',
      mobileTitle: (row, index) => `#${index} | ${row.codigo} | ${row.nombre}`,
      hideOnMobile: true,
    },

    { key: 'cantidad', label: 'Cant.' },

    {
      key: 'costo_unitario_prom',
      label: 'Costo U/P',
      headerBg: '#e3f2fd',
      render: (row) => {
        const promedio = row.cantidad > 0 ? row.costo_total / row.cantidad : 0

        return `Bs ${Number(promedio).toFixed(2)}`
      },
    },

    {
      key: 'costo_total',
      label: 'Costo Total',
      headerBg: '#e3f2fd',
      render: (row) => `Bs ${Number(row.costo_total).toFixed(2)}`,
    },

    {
      key: 'precio_venta',
      label: 'P. Vnta/U',
      headerBg: '#e8f5e9',
      render: (row) => `Bs ${Number(row.precio_venta).toFixed(2)}`,
    },
    {
      key: 'total_venta_realizable',
      label: 'Total Vta/R',
      headerBg: '#e8f5e9',
      render: (row) => `Bs ${Number(row.total_venta_realizable).toFixed(2)}`,
    },

    {
      key: 'margen_unitario',
      label: 'Margen U.',
      headerBg: '#f3e5f5',
      render: (row) => {
        const promedio = row.cantidad > 0 ? row.costo_total / row.cantidad : 0

        const margen = row.precio_venta - promedio

        const color =
          margen <= 0
            ? '#d32f2f' // rojo pérdida
            : margen < promedio * 0.1
              ? '#f57c00' // naranja margen bajo
              : '#2e7d32' // verde saludable

        return <span style={{ color, fontWeight: 600 }}>Bs {Number(margen).toFixed(2)}</span>
      },
    },

    {
      key: 'margen_porcentaje',
      label: 'Margen %',
      headerBg: '#f3e5f5',
      render: (row) => {
        const promedio = row.cantidad > 0 ? row.costo_total / row.cantidad : 0

        const margen = row.precio_venta - promedio

        const porcentaje = promedio > 0 ? (margen / promedio) * 100 : 0

        const color = porcentaje <= 0 ? '#d32f2f' : porcentaje < 15 ? '#f57c00' : '#2e7d32'

        return <span style={{ color, fontWeight: 700 }}>{porcentaje.toFixed(1)}%</span>
      },
    },
  ]

  return (
    <>
      <h4>Stock Inventario</h4>

      {/* ================= CABECERA ================= */}
      <CCard className="mb-3">
        <CCardBody>
          <CRow className="align-items-end">
            <CCol md={4}>
              <CFormSelect
                label="Sucursal"
                value={sucursalSeleccionada}
                onChange={(e) => setSucursalSeleccionada(e.target.value)}
              >
                <option value="">Seleccione</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ciudad} - {s.codigo_sucursal}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CButton
                color="primary"
                className="w-100"
                onClick={consultarStock}
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <CSpinner size="sm" /> Consultando...
                  </>
                ) : (
                  'Consultar Stock'
                )}
              </CButton>
            </CCol>

            {consultado && (
              <CCol md={5} className="text-end">
                <div className="mb-2">
                  <CButton size="sm" color="danger" className="me-2" onClick={exportarPDF}>
                    PDF
                  </CButton>

                  <CButton size="sm" color="success" onClick={exportarExcel}>
                    Excel
                  </CButton>
                </div>

                <div style={{ fontWeight: 600 }}>Costo Inventario: Bs {totalCosto.toFixed(2)}</div>
                <div style={{ fontWeight: 700 }}>
                  Total Valorizado: Bs {totalValorizado.toFixed(2)}
                </div>
              </CCol>
            )}
          </CRow>
        </CCardBody>
      </CCard>

      {/* ================= TABLA ================= */}
      {consultado && (
        <CCard>
          <CCardBody>
            <SmartTable columns={columns} data={stock} pageSize={10} />
          </CCardBody>
        </CCard>
      )}

      {!consultado && (
        <div className="text-center text-muted mt-5">
          Seleccione una sucursal y presione consultar
        </div>
      )}
    </>
  )
}

export default StockInventario
