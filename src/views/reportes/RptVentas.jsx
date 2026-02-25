import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CFormSelect,
  CFormInput,
  CRow,
  CCol,
  CSpinner,
  CBadge,
} from '@coreui/react'

import SmartTable from '../../components/SmartTable'
import reportesService from '../../services/reportes.service'
import { sucursalesService } from '../../services/sucursales.service'
import { clientesService } from '../../services/clientes.service'
import { productosService } from '../../services/productos.service'
import { categoriasService } from '../../services/categorias.service'
import { marcasService } from '../../services/marcas.service'
import { useAuthStore } from '../../store/auth.store'

import Select from 'react-select'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'

const RptVentas = () => {
  const usuario = useAuthStore((state) => state.usuario)

  const [sucursales, setSucursales] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])

  const [data, setData] = useState([])
  const [cargando, setCargando] = useState(false)

  const [modo, setModo] = useState('GENERAL')
  const [filtroId, setFiltroId] = useState(null)

  const [filtros, setFiltros] = useState({
    sucursalId: '',
    periodo: '',
    fechaInicio: '',
    fechaFin: '',
  })
  const [resumen, setResumen] = useState({
    totalGeneral: 0,
    totalAnulado: 0,
    totalNeto: 0,
  })
  // ================================
  // CARGAR LISTAS
  // ================================

  useEffect(() => {
    const cargar = async () => {
      const [suc, cli, prod, cat, mar] = await Promise.all([
        sucursalesService.listarActivas(),
        clientesService.listar(),
        productosService.listar(),
        categoriasService.listarActivas(),
        marcasService.listar(),
      ])

      setSucursales(suc.data)
      setClientes(cli.data)
      setProductos(prod.data.data || [])
      setCategorias(cat.data || [])
      setMarcas(mar.data || [])
    }

    cargar()
  }, [])

  // ================================
  // GENERAR REPORTE
  // ================================
  const cargarReporte = async () => {
    try {
      setCargando(true)

      const params = {
        ...filtros,
        clienteId: modo === 'CLIENTE' ? filtroId : null,
        productoId: modo === 'PRODUCTO' ? filtroId : null,
        marcaId: modo === 'MARCA' ? filtroId : null,
        categoriaId: modo === 'CATEGORIA' ? filtroId : null,
      }

      const res = await reportesService.reporteVentasDetalle(params)

      const lista = res.data.detalle || []
      const resumenData = res.data.resumen || {
        totalGeneral: 0,
        totalAnulado: 0,
        totalNeto: 0,
      }

      const dataOrdenada = lista.sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta))

      setData(dataOrdenada)
      setResumen(resumenData)
    } finally {
      setCargando(false)
    }
  }
  //   const cargarReporte = async () => {
  //     try {
  //       setCargando(true)

  //       const params = {
  //         ...filtros,
  //         clienteId: modo === 'CLIENTE' ? filtroId : null,
  //         productoId: modo === 'PRODUCTO' ? filtroId : null,
  //         marcaId: modo === 'MARCA' ? filtroId : null,
  //         categoriaId: modo === 'CATEGORIA' ? filtroId : null,
  //       }

  //       const res = await reportesService.reporteVentasDetalle(params)

  //       setData(res.data.sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta)))
  //     } finally {
  //       setCargando(false)
  //     }
  //   }

  // ================================
  // TOTAL GENERAL
  // ================================
  //const totalGeneral = data.reduce((acc, item) => acc + Number(item.subtotal), 0)

  // ================================
  // COLUMNAS TABLA
  // ================================
  const columns = [
    { key: 'codigo', label: 'Código' },

    {
      key: 'fecha_venta',
      label: 'Fecha',
      render: (row) => {
        const fecha = row.fecha_venta.slice(0, 10)
        const [y, m, d] = fecha.split('-')
        return `${d}/${m}/${y}`
      },
    },

    { key: 'cliente', label: 'Cliente' },
    { key: 'codigo_sucursal', label: 'Sucursal' },
    { key: 'categoria_nombre', label: 'Categoría' },
    { key: 'marca', label: 'Marca' },
    { key: 'producto_label', label: 'Producto' },
    { key: 'cantidad', label: 'Cant.' },

    {
      key: 'precio_unitario',
      label: 'Precio',
      render: (row) => `Bs ${Number(row.precio_unitario).toFixed(2)}`,
    },

    {
      key: 'subtotal',
      label: 'Subtotal',
      render: (row) => `Bs ${Number(row.subtotal).toFixed(2)}`,
    },

    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <CBadge
          color={
            row.estado === 'PAGADA'
              ? 'success'
              : row.estado === 'PENDIENTE'
                ? 'warning'
                : row.estado === 'ANULADA'
                  ? 'danger'
                  : 'info'
          }
        >
          {row.estado}
        </CBadge>
      ),
    },
  ]

  // ================================
  // EXPORTAR PDF
  // ================================
  const exportarPDF = () => {
    if (!data.length) {
      Swal.fire('Sin datos', 'No hay información para exportar', 'info')
      return
    }

    // 🔥 MODO HORIZONTAL CARTA
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter',
    })

    const sucursalNombre =
      filtros.sucursalId === 'TODAS'
        ? 'Todas las sucursales'
        : sucursales.find((s) => s.id == filtros.sucursalId)?.codigo_sucursal || ''

    const periodoTexto =
      filtros.periodo === 'RANGO' ? `${filtros.fechaInicio} - ${filtros.fechaFin}` : filtros.periodo

    const filtroTexto = modo === 'GENERAL' ? 'General' : `${modo} - ${getNombreFiltro()}`

    // ================= CABECERA =================
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('REPORTE DE VENTAS', 14, 15)

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    doc.text(`Sucursal: ${sucursalNombre}`, 14, 25)
    doc.text(`Periodo: ${periodoTexto}`, 14, 31)
    doc.text(`Filtro: ${filtroTexto}`, 14, 37)
    doc.text(`Usuario: ${usuario?.nombre || ''}`, 14, 43)
    doc.text(
      `Generado: ${new Date().toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
      })}`,
      14,
      49,
    )

    // ================= COLUMNAS =================
    const tableColumn = [
      '#',
      'Código',
      'Fecha',
      'Cliente',
      'Sucursal',
      'Categoría',
      'Marca',
      'Producto',
      'Cant.',
      'Precio',
      'Subtotal',
      'Estado', // 👈 NUEVO
    ]

    const tableRows = data.map((item, index) => [
      index + 1,
      item.codigo,
      item.fecha_venta.slice(0, 10),
      item.cliente,
      item.codigo_sucursal,
      item.categoria_nombre || '',
      item.marca || '',
      item.producto_label,
      item.cantidad,
      Number(item.precio_unitario).toFixed(2),
      Number(item.subtotal).toFixed(2),
      item.estado, // 👈 NUEVO
    ])

    let ultimoCodigo = null
    let pintarGris = false

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [31, 78, 120],
        textColor: [255, 255, 255],
      },
      theme: 'grid',

      didParseCell: function (dataArg) {
        if (dataArg.section === 'body') {
          const estado = dataArg.row.raw[11]

          // 🔴 Pintar anuladas en rojo
          if (estado === 'ANULADA') {
            dataArg.cell.styles.textColor = [180, 0, 0]
          }

          // Alternar gris por grupo de código
          const codigoActual = dataArg.row.raw[1]

          if (codigoActual !== ultimoCodigo) {
            pintarGris = !pintarGris
            ultimoCodigo = codigoActual
          }

          if (pintarGris) {
            dataArg.cell.styles.fillColor = [242, 242, 242]
          }
        }
      },
    })

    // ================= RESUMEN =================
    const finalY = doc.lastAutoTable.finalY + 10

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')

    doc.text(`Ventas Generadas: Bs ${Number(resumen.totalGeneral).toFixed(2)}`, 14, finalY)

    doc.text(`Ventas Anuladas: Bs ${Number(resumen.totalAnulado).toFixed(2)}`, 14, finalY + 7)

    doc.text(`Ventas Netas: Bs ${Number(resumen.totalNeto).toFixed(2)}`, 14, finalY + 14)

    doc.save('Reporte_Ventas.pdf')
  }
  // ================================
  // EXPORTAR EXCEL
  // ================================
  //   const exportarExcel = () => {
  //     if (!data.length) {
  //       Swal.fire('Sin datos', 'No hay información para exportar', 'info')
  //       return
  //     }

  //     const sucursalNombre =
  //       filtros.sucursalId === 'TODAS'
  //         ? 'Todas las sucursales'
  //         : sucursales.find((s) => s.id == filtros.sucursalId)?.codigo_sucursal || ''

  //     const periodoTexto =
  //       filtros.periodo === 'RANGO' ? `${filtros.fechaInicio} - ${filtros.fechaFin}` : filtros.periodo

  //     const filtroTexto = modo === 'GENERAL' ? 'General' : `${modo} - ${getNombreFiltro()}`

  //     const infoHeader = [
  //       ['REPORTE DE VENTAS'],
  //       [`Sucursal: ${sucursalNombre}`],
  //       [`Periodo: ${periodoTexto}`],
  //       [`Filtro: ${filtroTexto}`],
  //       [`Usuario: ${usuario?.nombre || ''}`],
  //       [
  //         `Generado: ${new Date().toLocaleString('es-BO', {
  //           timeZone: 'America/La_Paz',
  //         })}`,
  //       ],
  //       [],
  //     ]

  //     const headers = [
  //       '#',
  //       'Codigo',
  //       'Fecha',
  //       'Cliente',
  //       'Sucursal',
  //       'Categoria',
  //       'Marca',
  //       'Producto',
  //       'Cantidad',
  //       'Precio',
  //       'Subtotal',
  //     ]

  //     const rows = data.map((item, index) => [
  //       index + 1,
  //       item.codigo,
  //       item.fecha_venta.slice(0, 10),
  //       item.cliente,
  //       item.codigo_sucursal,
  //       item.categoria_nombre || '',
  //       item.marca || '',
  //       item.producto_label,
  //       Number(item.cantidad),
  //       Number(item.precio_unitario),
  //       Number(item.subtotal),
  //     ])

  //     const worksheet = XLSX.utils.aoa_to_sheet([...infoHeader, headers, ...rows])

  //     const headerRowIndex = infoHeader.length

  //     // ===== ESTILO HEADER =====
  //     for (let col = 0; col < headers.length; col++) {
  //       const cellAddress = XLSX.utils.encode_cell({
  //         r: headerRowIndex,
  //         c: col,
  //       })

  //       worksheet[cellAddress].s = {
  //         font: { bold: true, color: { rgb: 'FFFFFF' } },
  //         fill: { patternType: 'solid', fgColor: { rgb: '1F4E78' } },
  //         alignment: { horizontal: 'center' },
  //         border: {
  //           top: { style: 'thin' },
  //           bottom: { style: 'thin' },
  //           left: { style: 'thin' },
  //           right: { style: 'thin' },
  //         },
  //       }
  //     }

  //     // ===== PINTADO POR GRUPO (por Código de Venta) =====
  //     let ultimoCodigo = null
  //     let pintarGris = false

  //     rows.forEach((rowData, index) => {
  //       const codigoActual = rowData[1]

  //       if (codigoActual !== ultimoCodigo) {
  //         pintarGris = !pintarGris
  //         ultimoCodigo = codigoActual
  //       }

  //       const excelRow = headerRowIndex + 1 + index

  //       for (let col = 0; col < headers.length; col++) {
  //         const cellAddress = XLSX.utils.encode_cell({
  //           r: excelRow,
  //           c: col,
  //         })

  //         if (!worksheet[cellAddress]) continue

  //         worksheet[cellAddress].s = {
  //           fill: pintarGris ? { patternType: 'solid', fgColor: { rgb: 'E6E6E6' } } : undefined,
  //           border: {
  //             top: { style: 'thin' },
  //             bottom: { style: 'thin' },
  //             left: { style: 'thin' },
  //             right: { style: 'thin' },
  //           },
  //         }
  //       }

  //       // ===== FORMATO NUMÉRICO =====
  //       const precioCell = XLSX.utils.encode_cell({
  //         r: excelRow,
  //         c: 9, // Precio
  //       })

  //       const subtotalCell = XLSX.utils.encode_cell({
  //         r: excelRow,
  //         c: 10, // Subtotal
  //       })

  //       if (worksheet[precioCell]) worksheet[precioCell].z = '#,##0.00'
  //       if (worksheet[subtotalCell]) worksheet[subtotalCell].z = '#,##0.00'
  //     })

  //     // ===== TOTAL GENERAL =====
  //     const totalRow = headerRowIndex + rows.length + 2

  //     worksheet[XLSX.utils.encode_cell({ r: totalRow, c: 9 })] = {
  //       t: 's',
  //       v: 'TOTAL GENERAL:',
  //       s: { font: { bold: true } },
  //     }

  //     worksheet[XLSX.utils.encode_cell({ r: totalRow, c: 10 })] = {
  //       t: 'n',
  //       v: totalGeneral,
  //       z: '#,##0.00',
  //       s: { font: { bold: true } },
  //     }

  //     // ===== AUTO ANCHO COLUMNAS =====
  //     worksheet['!cols'] = headers.map((header, i) => {
  //       const maxLength = Math.max(header.length, ...rows.map((row) => String(row[i] || '').length))
  //       return { wch: maxLength + 4 }
  //     })

  //     const workbook = XLSX.utils.book_new()
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Ventas')

  //     const excelBuffer = XLSX.write(workbook, {
  //       bookType: 'xlsx',
  //       type: 'array',
  //     })

  //     const blob = new Blob([excelBuffer], {
  //       type: 'application/octet-stream',
  //     })

  //     saveAs(blob, 'Reporte_Ventas.xlsx')
  //   }
  const exportarExcel = () => {
    if (!data.length) {
      Swal.fire('Sin datos', 'No hay información para exportar', 'info')
      return
    }

    const sucursalNombre =
      filtros.sucursalId === 'TODAS'
        ? 'Todas las sucursales'
        : sucursales.find((s) => s.id == filtros.sucursalId)?.codigo_sucursal || ''

    const periodoTexto =
      filtros.periodo === 'RANGO' ? `${filtros.fechaInicio} - ${filtros.fechaFin}` : filtros.periodo

    const filtroTexto = modo === 'GENERAL' ? 'General' : `${modo} - ${getNombreFiltro()}`

    const infoHeader = [
      ['REPORTE DE VENTAS'],
      [`Sucursal: ${sucursalNombre}`],
      [`Periodo: ${periodoTexto}`],
      [`Filtro: ${filtroTexto}`],
      [`Usuario: ${usuario?.nombre || ''}`],
      [
        `Generado: ${new Date().toLocaleString('es-BO', {
          timeZone: 'America/La_Paz',
        })}`,
      ],
      [],
    ]

    const headers = [
      '#',
      'Codigo',
      'Fecha',
      'Cliente',
      'Sucursal',
      'Categoria',
      'Marca',
      'Producto',
      'Cantidad',
      'Precio',
      'Subtotal',
      'Estado', // 👈 NUEVO
    ]

    const rows = data.map((item, index) => [
      index + 1,
      item.codigo,
      item.fecha_venta.slice(0, 10),
      item.cliente,
      item.codigo_sucursal,
      item.categoria_nombre || '',
      item.marca || '',
      item.producto_label,
      Number(item.cantidad),
      Number(item.precio_unitario),
      Number(item.subtotal),
      item.estado, // 👈 NUEVO
    ])

    const worksheet = XLSX.utils.aoa_to_sheet([...infoHeader, headers, ...rows])

    const headerRowIndex = infoHeader.length

    // ===== ESTILO HEADER =====
    for (let col = 0; col < headers.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({
        r: headerRowIndex,
        c: col,
      })

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { patternType: 'solid', fgColor: { rgb: '1F4E78' } },
        alignment: { horizontal: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      }
    }

    // ===== PINTADO POR GRUPO + ANULADAS =====
    let ultimoCodigo = null
    let pintarGris = false

    rows.forEach((rowData, index) => {
      const codigoActual = rowData[1]
      const estado = rowData[11]

      if (codigoActual !== ultimoCodigo) {
        pintarGris = !pintarGris
        ultimoCodigo = codigoActual
      }

      const excelRow = headerRowIndex + 1 + index

      for (let col = 0; col < headers.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: excelRow,
          c: col,
        })

        if (!worksheet[cellAddress]) continue

        // 🔴 ANULADAS en rojo claro
        if (estado === 'ANULADA') {
          worksheet[cellAddress].s = {
            fill: { patternType: 'solid', fgColor: { rgb: 'FFD9D9' } },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            },
          }
        }
        // Alternar gris por grupo
        else if (pintarGris) {
          worksheet[cellAddress].s = {
            fill: { patternType: 'solid', fgColor: { rgb: 'E6E6E6' } },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            },
          }
        } else {
          worksheet[cellAddress].s = {
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            },
          }
        }
      }

      // ===== FORMATO NUMÉRICO =====
      const precioCell = XLSX.utils.encode_cell({ r: excelRow, c: 9 })
      const subtotalCell = XLSX.utils.encode_cell({ r: excelRow, c: 10 })

      if (worksheet[precioCell]) worksheet[precioCell].z = '#,##0.00'
      if (worksheet[subtotalCell]) worksheet[subtotalCell].z = '#,##0.00'
    })

    // ===== RESUMEN CONTABLE =====
    const resumenFilas = [
      [],
      ['', '', '', '', '', '', '', '', '', 'Ventas Generadas:', Number(resumen.totalGeneral)],
      ['', '', '', '', '', '', '', '', '', 'Ventas Anuladas:', Number(resumen.totalAnulado)],
      ['', '', '', '', '', '', '', '', '', 'Ventas Netas:', Number(resumen.totalNeto)],
    ]

    XLSX.utils.sheet_add_aoa(
      worksheet,
      resumenFilas,
      { origin: -1 }, 
    )

    // ===== AUTO ANCHO COLUMNAS =====
    worksheet['!cols'] = headers.map((header, i) => {
      const maxLength = Math.max(header.length, ...rows.map((row) => String(row[i] || '').length))
      return { wch: maxLength + 4 }
    })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Ventas')

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    })

    saveAs(blob, 'Reporte_Ventas.xlsx')
  }

  return (
    <CCard>
      <CCardBody>
        <CRow className="mb-4">
          <CCol md={3}>
            <CFormSelect
              value={filtros.sucursalId}
              onChange={(e) => setFiltros({ ...filtros, sucursalId: e.target.value })}
            >
              <option value="">Sucursal</option>
              <option value="TODAS">Todas las sucursales</option>
              {/* <option value="GLOBAL">Global</option> */}
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.codigo_sucursal} - {s.ciudad}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormSelect
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
            >
              <option value="">Periodo</option>
              <option value="HOY">Hoy</option>
              <option value="SEMANA">Semana</option>
              <option value="MES">Mes</option>
              <option value="RANGO">Entre Fechas</option>
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormSelect
              value={modo}
              onChange={(e) => {
                setModo(e.target.value)
                setFiltroId(null)
              }}
            >
              <option value="GENERAL">General</option>
              <option value="CLIENTE">Por Cliente</option>
              <option value="PRODUCTO">Por Producto</option>
              <option value="MARCA">Por Marca</option>
              <option value="CATEGORIA">Por Categoría</option>
            </CFormSelect>
          </CCol>

          <CCol md={2}>
            <CButton
              color="primary"
              onClick={cargarReporte}
              disabled={!filtros.sucursalId || !filtros.periodo}
            >
              Generar
            </CButton>
          </CCol>
        </CRow>

        {cargando ? (
          <div className="text-center p-4">
            <CSpinner />
          </div>
        ) : (
          <>
            <CRow className="mb-4">
              <CCol md={4}>
                <CCard className="text-center border-success">
                  <CCardBody>
                    <h6 className="text-muted">Ventas General</h6>
                    <h4 className="text-success">Bs {Number(resumen.totalGeneral).toFixed(2)}</h4>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={4}>
                <CCard className="text-center border-danger">
                  <CCardBody>
                    <h6 className="text-muted">Ventas Anuladas</h6>
                    <h4 className="text-danger">Bs {Number(resumen.totalAnulado).toFixed(2)}</h4>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={4}>
                <CCard className="text-center border-primary">
                  <CCardBody>
                    <h6 className="text-muted">Saldo Activo</h6>
                    <h4 className="text-primary">Bs {Number(resumen.totalNeto).toFixed(2)}</h4>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol className="text-end">
                <CButton color="danger" className="me-2" onClick={exportarPDF}>
                  <CIcon icon={cilCloudDownload} className="me-1" />
                  PDF
                </CButton>

                <CButton color="success" onClick={exportarExcel}>
                  <CIcon icon={cilCloudDownload} className="me-1" />
                  Excel
                </CButton>
              </CCol>
            </CRow>

            <SmartTable columns={columns} data={data} pageSize={15} />

            {/* <div className="text-end mt-3">
              <h5>Total General: Bs {totalGeneral.toFixed(2)}</h5>
            </div> */}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default RptVentas
