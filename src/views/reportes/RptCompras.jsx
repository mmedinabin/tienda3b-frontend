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
import { useAuthStore } from '../../store/auth.store'
import Select from 'react-select'
import { productosService } from '../../services/productos.service'
import { proveedoresService } from '../../services/proveedores.service'
import { categoriasService } from '../../services/categorias.service'
import { marcasService } from '../../services/marcas.service'

import { saveAs } from 'file-saver'
//import * as XLSX from 'xlsx'
import * as XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import { cilFile, cilPrint } from '@coreui/icons'
import { cilCloudDownload } from '@coreui/icons'
import autoTable from 'jspdf-autotable'
import CIcon from '@coreui/icons-react'

const ReporteCompras = () => {
  const usuario = useAuthStore((state) => state.usuario)

  const [sucursales, setSucursales] = useState([])
  const [data, setData] = useState([])
  const [cargando, setCargando] = useState(false)

  const [filtros, setFiltros] = useState({
    sucursalId: '',
    periodo: '',
    fechaInicio: '',
    fechaFin: '',
  })

  const [modo, setModo] = useState('GENERAL')
  const [filtroId, setFiltroId] = useState(null)

  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])

  const [resumen, setResumen] = useState({
    totalGeneral: 0,
    totalAnulado: 0,
    totalNeto: 0,
    saldoPendiente: 0,
  })

  // ===============================
  // Cargar sucursales activas
  // ===============================
  useEffect(() => {
    const cargarSucursales = async () => {
      try {
        const res = await sucursalesService.listarActivas()
        setSucursales(res.data)
      } catch (error) {
        alertError('Error al cargar sucursales')
      }
    }

    cargarSucursales()
  }, [])
  useEffect(() => {
    const cargarListas = async () => {
      try {
        const prod = await productosService.listar()
        const prov = await proveedoresService.listar()
        const cat = await categoriasService.listarActivas()
        const mar = await marcasService.listar()

        setProductos(prod.data.data || [])
        setProveedores(prov.data || [])
        setCategorias(cat.data || [])
        setMarcas(mar.data || [])
      } catch (error) {
        console.log(error)
      }
    }

    cargarListas()
  }, [])
  // ===============================
  // Generar reporte
  // ===============================
  const cargarReporte = async () => {
    try {
      setCargando(true)

      const params = {
        ...filtros,
        productoId: modo === 'PRODUCTO' ? filtroId : null,
        proveedorId: modo === 'PROVEEDOR' ? filtroId : null,
        marcaId: modo === 'MARCA' ? filtroId : null,
        categoriaId: modo === 'CATEGORIA' ? filtroId : null,
      }

      // const res = await reportesService.reporteComprasDetalle(params)
      // setData(res.data)
      const res = await reportesService.reporteComprasDetalle(params)

      const lista = res.data.detalle || []
      const resumenData = res.data.resumen || {
        totalGeneral: 0,
        totalAnulado: 0,
        totalNeto: 0,
        saldoPendiente: 0,
      }

      setData(lista)
      setResumen(resumenData)
    } catch (error) {
      alertError('Error al generar reporte')
    } finally {
      setCargando(false)
    }
  }

  // ===============================
  // Totales
  // ===============================
  //const totalGeneral = data.reduce((acc, item) => acc + Number(item.costo_subtotal), 0)

  // ===============================
  // Columnas tabla
  // ===============================
  const columns = [
    { key: 'codigo', label: 'Código' },

    {
      key: 'fecha_compra',
      label: 'Fecha',
      render: (row) => {
        const fecha = row.fecha_compra.slice(0, 10)
        const [year, month, day] = fecha.split('-')
        return `${day}/${month}/${year}`
      },
    },

    { key: 'proveedor', label: 'Proveedor' },
    { key: 'sucursal', label: 'Sucursal' },
    { key: 'marca', label: 'Marca' },
    { key: 'producto_label', label: 'Producto' },
    { key: 'cantidad', label: 'Cant.' },

    {
      key: 'costo_unitario',
      label: 'Costo',
      render: (row) => `Bs ${Number(row.costo_unitario).toFixed(2)}`,
    },

    {
      key: 'costo_subtotal',
      label: 'Subtotal',
      render: (row) => `Bs ${Number(row.costo_subtotal).toFixed(2)}`,
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
                : row.estado === 'PARCIAL'
                  ? 'info'
                  : 'danger'
          }
        >
          {row.estado}
        </CBadge>
      ),
    },
  ]

  const getNombreFiltro = () => {
    if (modo === 'PRODUCTO') return productos.find((p) => p.id == filtroId)?.nombre || ''

    if (modo === 'PROVEEDOR') return proveedores.find((p) => p.id == filtroId)?.nombre || ''

    if (modo === 'CATEGORIA') return categorias.find((c) => c.id == filtroId)?.nombre || ''

    if (modo === 'MARCA') return marcas.find((m) => m.id == filtroId)?.nombre || ''

    return ''
  }

  const exportarPDF = () => {
    if (!data.length) {
      Swal.fire('Sin datos', 'No hay información para exportar', 'info')
      return
    }

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
    doc.text('REPORTE DE COMPRAS', 14, 15)

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
      'Proveedor',
      'Categoría',
      'Marca',
      'Producto',
      'Cant.',
      'Costo',
      'Subtotal',
      'Estado', // 👈 NUEVO
    ]

    const tableRows = data.map((item, index) => [
      index + 1,
      item.codigo,
      item.fecha_compra.slice(0, 10),
      item.proveedor,
      item.categoria_nombre || '',
      item.marca || '',
      item.producto_label,
      item.cantidad,
      Number(item.costo_unitario).toFixed(2),
      Number(item.costo_subtotal).toFixed(2),
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
          const estado = dataArg.row.raw[10]

          // 🔴 ANULADAS en rojo
          if (estado === 'ANULADA') {
            dataArg.cell.styles.textColor = [180, 0, 0]
          }

          // Alternado gris por código
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

    doc.text(`Compras Generadas: Bs ${Number(resumen.totalGeneral).toFixed(2)}`, 14, finalY)

    doc.text(`Compras Anuladas: Bs ${Number(resumen.totalAnulado).toFixed(2)}`, 14, finalY + 7)

    doc.text(`Compras Netas: Bs ${Number(resumen.totalNeto).toFixed(2)}`, 14, finalY + 14)

    doc.text(`Por Pagar/Credito: Bs ${Number(resumen.saldoPendiente).toFixed(2)}`, 14, finalY + 21)

    doc.save('Reporte_Compras.pdf')
  }
  // const exportarExcel = () => {
  //   if (!data.length) {
  //     Swal.fire('Sin datos', 'No hay información para exportar', 'info')
  //     return
  //   }

  //   const sucursalNombre =
  //     filtros.sucursalId === 'TODAS'
  //       ? 'Todas las sucursales'
  //       : sucursales.find((s) => s.id == filtros.sucursalId)?.codigo_sucursal || ''

  //   // const sucursalNombre =
  //   //   sucursales.find((s) => s.id == filtros.sucursalId)?.codigo_sucursal || 'Global'

  //   const periodoTexto =
  //     filtros.periodo === 'RANGO' ? `${filtros.fechaInicio} - ${filtros.fechaFin}` : filtros.periodo

  //   const filtroTexto = modo === 'GENERAL' ? 'General' : `${modo} - ${getNombreFiltro()}`

  //   const infoHeader = [
  //     ['REPORTE DE COMPRAS'],
  //     [`Sucursal: ${sucursalNombre}`],
  //     [`Periodo: ${periodoTexto}`],
  //     [`Filtro: ${filtroTexto}`],
  //     [`Usuario: ${usuario?.nombre || ''}`],
  //     [`Generado: ${new Date().toLocaleString()}`],
  //     [],
  //   ]

  //   const headers = [
  //     '#',
  //     'Codigo',
  //     'Fecha',
  //     'Proveedor',
  //     'Categoria',
  //     'Marca',
  //     'Producto',
  //     'Cantidad',
  //     'Costo',
  //     'Subtotal',
  //   ]

  //   const rows = data.map((item, index) => [
  //     index + 1,
  //     item.codigo,
  //     item.fecha_compra.slice(0, 10),
  //     item.proveedor,
  //     item.categoria_nombre || '',
  //     item.marca || '',
  //     item.producto_label,
  //     Number(item.cantidad),
  //     Number(item.costo_unitario),
  //     Number(item.costo_subtotal),
  //   ])

  //   const worksheet = XLSX.utils.aoa_to_sheet([...infoHeader, headers, ...rows])

  //   const headerRowIndex = infoHeader.length

  //   // ===== Estilo Header Tabla =====
  //   for (let col = 0; col < headers.length; col++) {
  //     const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col })

  //     worksheet[cellAddress].s = {
  //       font: { bold: true, color: { rgb: 'FFFFFF' } },
  //       fill: { patternType: 'solid', fgColor: { rgb: '1F4E78' } },
  //       alignment: { horizontal: 'center' },
  //       border: {
  //         top: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         left: { style: 'thin' },
  //         right: { style: 'thin' },
  //       },
  //     }
  //   }

  //   // ===== Pintado por grupo =====
  //   let ultimoCodigo = null
  //   let pintarGris = false

  //   rows.forEach((rowData, index) => {
  //     const codigoActual = rowData[1]

  //     if (codigoActual !== ultimoCodigo) {
  //       pintarGris = !pintarGris
  //       ultimoCodigo = codigoActual
  //     }

  //     const excelRow = headerRowIndex + 1 + index

  //     for (let col = 0; col < headers.length; col++) {
  //       const cellAddress = XLSX.utils.encode_cell({ r: excelRow, c: col })

  //       if (!worksheet[cellAddress]) continue

  //       worksheet[cellAddress].s = {
  //         fill: pintarGris ? { patternType: 'solid', fgColor: { rgb: 'E6E6E6' } } : undefined,
  //         //fill: pintarGris ? { patternType: 'solid', fgColor: { rgb: 'F2F2F2' } } : undefined,
  //         border: {
  //           top: { style: 'thin' },
  //           bottom: { style: 'thin' },
  //           left: { style: 'thin' },
  //           right: { style: 'thin' },
  //         },
  //       }
  //     }

  //     // Formato numérico
  //     const costoCell = XLSX.utils.encode_cell({ r: excelRow, c: 8 })
  //     const subtotalCell = XLSX.utils.encode_cell({ r: excelRow, c: 9 })

  //     if (worksheet[costoCell]) worksheet[costoCell].z = '#,##0.00'
  //     if (worksheet[subtotalCell]) worksheet[subtotalCell].z = '#,##0.00'
  //   })

  //   const totalRow = headerRowIndex + rows.length + 2

  //   worksheet[XLSX.utils.encode_cell({ r: totalRow, c: 8 })] = {
  //     t: 's',
  //     v: 'TOTAL GENERAL:',
  //     s: { font: { bold: true } },
  //   }

  //   worksheet[XLSX.utils.encode_cell({ r: totalRow, c: 9 })] = {
  //     t: 'n',
  //     v: totalGeneral,
  //     z: '#,##0.00',
  //     s: { font: { bold: true } },
  //   }

  //   worksheet['!cols'] = headers.map((header, i) => {
  //     const maxLength = Math.max(header.length, ...rows.map((row) => String(row[i] || '').length))
  //     return { wch: maxLength + 4 }
  //   })

  //   const workbook = XLSX.utils.book_new()
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Compras')

  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: 'xlsx',
  //     type: 'array',
  //   })

  //   const blob = new Blob([excelBuffer], {
  //     type: 'application/octet-stream',
  //   })

  //   saveAs(blob, 'Reporte_Compras.xlsx')
  // }

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
      ['REPORTE DE COMPRAS'],
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
      'Proveedor',
      'Categoria',
      'Marca',
      'Producto',
      'Cantidad',
      'Costo',
      'Subtotal',
      'Estado', // 👈 NUEVO
    ]

    const rows = data.map((item, index) => [
      index + 1,
      item.codigo,
      item.fecha_compra.slice(0, 10),
      item.proveedor,
      item.categoria_nombre || '',
      item.marca || '',
      item.producto_label,
      Number(item.cantidad),
      Number(item.costo_unitario),
      Number(item.costo_subtotal),
      item.estado, // 👈 NUEVO
    ])

    const worksheet = XLSX.utils.aoa_to_sheet([...infoHeader, headers, ...rows])

    const headerRowIndex = infoHeader.length

    // ===== Estilo Header =====
    for (let col = 0; col < headers.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col })

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

    // ===== Pintado por grupo + ANULADAS =====
    let ultimoCodigo = null
    let pintarGris = false

    rows.forEach((rowData, index) => {
      const codigoActual = rowData[1]
      const estado = rowData[10]

      if (codigoActual !== ultimoCodigo) {
        pintarGris = !pintarGris
        ultimoCodigo = codigoActual
      }

      const excelRow = headerRowIndex + 1 + index

      for (let col = 0; col < headers.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: excelRow, c: col })

        if (!worksheet[cellAddress]) continue

        // 🔴 ANULADAS
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
        // Alternado gris
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

      // Formato numérico
      const costoCell = XLSX.utils.encode_cell({ r: excelRow, c: 8 })
      const subtotalCell = XLSX.utils.encode_cell({ r: excelRow, c: 9 })

      if (worksheet[costoCell]) worksheet[costoCell].z = '#,##0.00'
      if (worksheet[subtotalCell]) worksheet[subtotalCell].z = '#,##0.00'
    })

    // ===== RESUMEN CONTABLE =====
    const resumenFilas = [
      [],
      ['', '', '', '', '', '', '', '', '', 'Compras Generadas:', Number(resumen.totalGeneral)],
      ['', '', '', '', '', '', '', '', '', 'Compras Anuladas:', Number(resumen.totalAnulado)],
      ['', '', '', '', '', '', '', '', '', 'Compras Netas:', Number(resumen.totalNeto)],
      ['', '', '', '', '', '', '', '', '', 'Por pagar/Credito:', Number(resumen.saldoPendiente)],
    ]

    XLSX.utils.sheet_add_aoa(worksheet, resumenFilas, { origin: -1 })

    // Formato numérico resumen
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    const lastRow = range.e.r

    for (let i = lastRow - 3; i <= lastRow; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: 10 })
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].z = '#,##0.00'
      }
    }

    // Auto ancho columnas
    worksheet['!cols'] = headers.map((header, i) => {
      const maxLength = Math.max(header.length, ...rows.map((row) => String(row[i] || '').length))
      return { wch: maxLength + 4 }
    })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Compras')

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    })

    saveAs(blob, 'Reporte_Compras.xlsx')
  }

  return (
    <CCard>
      <CCardBody>
        {/* ========================= */}
        {/* FILTROS */}
        {/* ========================= */}
        <CRow className="mb-4">
          {/* Sucursal */}
          <CCol md={3}>
            <CFormSelect
              value={filtros.sucursalId}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  sucursalId: e.target.value,
                  periodo: '',
                })
              }
            >
              <option value="">Seleccione sucursal</option>
              <option value="TODAS">Todas las sucursales</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.codigo_sucursal} - {s.ciudad}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          {/* Periodo */}
          <CCol md={3}>
            <CFormSelect
              disabled={!filtros.sucursalId}
              value={filtros.periodo}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  periodo: e.target.value,
                })
              }
            >
              <option value="">Periodo</option>
              <option value="HOY">Hoy</option>
              <option value="SEMANA">Semana</option>
              <option value="MES">Mes</option>
              <option value="RANGO">Entre Fechas</option>
            </CFormSelect>
          </CCol>

          {/* Tipo de filtro */}
          <CCol md={3}>
            <CFormSelect
              disabled={!filtros.periodo}
              value={modo}
              onChange={(e) => {
                setModo(e.target.value)
                setFiltroId(null)
              }}
            >
              <option value="GENERAL">General</option>
              <option value="PRODUCTO">Por Producto</option>
              <option value="PROVEEDOR">Por Proveedor</option>
              <option value="MARCA">Por Marca</option>
              <option value="CATEGORIA">Por Categoría</option>
            </CFormSelect>
          </CCol>

          {/* Filtro dinámico */}
          {modo !== 'GENERAL' && (
            <CCol md={4}>
              {modo === 'PRODUCTO' && (
                <Select
                  placeholder="Buscar producto..."
                  options={productos.map((p) => ({
                    value: p.id,
                    label: p.nombre,
                  }))}
                  onChange={(opt) => setFiltroId(opt?.value)}
                />
              )}

              {modo === 'PROVEEDOR' && (
                <Select
                  placeholder="Buscar proveedor..."
                  options={proveedores.map((p) => ({
                    value: p.id,
                    label: p.nombre,
                  }))}
                  onChange={(opt) => setFiltroId(opt?.value)}
                />
              )}

              {modo === 'MARCA' && (
                <Select
                  placeholder="Buscar marca..."
                  options={marcas.map((m) => ({
                    value: m.id,
                    label: m.nombre,
                  }))}
                  onChange={(opt) => setFiltroId(opt?.value)}
                />
              )}

              {modo === 'CATEGORIA' && (
                <Select
                  placeholder="Buscar categoría..."
                  options={categorias.map((c) => ({
                    value: c.id,
                    label: c.nombre,
                  }))}
                  onChange={(opt) => setFiltroId(opt?.value)}
                />
              )}
            </CCol>
          )}

          {/* Fechas */}
          {filtros.periodo === 'RANGO' && (
            <>
              <CCol md={2}>
                <CFormInput
                  type="date"
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      fechaInicio: e.target.value,
                    })
                  }
                />
              </CCol>

              <CCol md={2}>
                <CFormInput
                  type="date"
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      fechaFin: e.target.value,
                    })
                  }
                />
              </CCol>
            </>
          )}

          {/* Botón */}
          <CCol md={2}>
            <CButton
              color="primary"
              disabled={
                !filtros.sucursalId || !filtros.periodo || (modo !== 'GENERAL' && !filtroId)
              }
              onClick={cargarReporte}
            >
              Generar
            </CButton>
          </CCol>
        </CRow>

        {/* ========================= */}
        {/* TABLA */}
        {/* ========================= */}
        {cargando ? (
          <div className="text-center p-4">
            <CSpinner />
          </div>
        ) : (
          <>
            <CRow className="mt-4">
              <CCol md={3}>
                <CCard className="text-center border-primary">
                  <CCardBody>
                    <small className="text-muted">Compras Generadas</small>
                    <h5 className="text-primary">Bs {Number(resumen.totalGeneral).toFixed(2)}</h5>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={3}>
                <CCard className="text-center border-danger">
                  <CCardBody>
                    <small className="text-muted">Compras Anuladas</small>
                    <h5 className="text-danger">Bs {Number(resumen.totalAnulado).toFixed(2)}</h5>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={3}>
                <CCard className="text-center border-success">
                  <CCardBody>
                    <small className="text-muted">Compras Netas/Pagadas</small>
                    <h5 className="text-success">Bs {Number(resumen.totalNeto).toFixed(2)}</h5>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={3}>
                <CCard className="text-center border-warning">
                  <CCardBody>
                    <small className="text-muted">Por pagar (CREDITO)</small>
                    <h5 className="text-warning">Bs {Number(resumen.saldoPendiente).toFixed(2)}</h5>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol className="text-end">
                <CButton
                  color="danger"
                  className="me-2"
                  onClick={exportarPDF}
                  disabled={!data.length}
                >
                  <CIcon icon={cilCloudDownload} className="me-1" />
                  PDF
                </CButton>

                <CButton color="success" onClick={exportarExcel} disabled={!data.length}>
                  <CIcon icon={cilCloudDownload} className="me-1" />
                  Excel
                </CButton>
              </CCol>
            </CRow>
            <SmartTable columns={columns} data={data} pageSize={15} />

            {/* Totales */}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ReporteCompras
