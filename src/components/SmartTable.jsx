import React, { useState, useMemo, useEffect } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CFormSelect,
  CButton,
  CCard,
  CCardBody,
} from '@coreui/react'

const SmartTable = ({ columns, data = [], pageSize = 10 }) => {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(pageSize)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* ================= FILTRO ================= */
  const filteredData = useMemo(() => {
    if (!search) return data

    return data.filter((row) =>
      columns.some((col) =>
        String(row[col.key] ?? '')
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    )
  }, [search, data, columns])

  /* ================= VARIABLES ADAPTATIVAS ================= */
  const totalRecords = filteredData.length
  const showSearch = data.length > 10
  const showRowsSelector = totalRecords > 10
  const showPagination = totalRecords > rowsPerPage

  /* ================= PAGINACIÓN ================= */
  const totalPages = Math.ceil(totalRecords / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage

  const paginatedData = useMemo(() => {
    if (!showPagination) return filteredData
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, startIndex, endIndex, showPagination])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, rowsPerPage])

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  /* ================= ESTADO VACÍO ================= */
  if (!data.length) {
    return <div className="text-center text-muted py-4">No hay registros disponibles</div>
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      {(showSearch || (!isMobile && showRowsSelector)) && (
        <div
          className={`mb-3 ${
            isMobile
              ? 'd-flex flex-column gap-3'
              : 'd-flex justify-content-between align-items-center'
          }`}
        >
          {/* BUSCADOR */}
          {showSearch && (
            <div style={{ position: 'relative', width: isMobile ? '100%' : 300 }}>
              <CFormInput
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 35, paddingRight: 35 }}
              />

              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                }}
              >
                🔍
              </span>

              {search && (
                <span
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#999',
                  }}
                >
                  ✖
                </span>
              )}
            </div>
          )}

          {/* REGISTROS POR PÁGINA */}
          {!isMobile && showRowsSelector && (
            <div className="d-flex align-items-center gap-2">
              <span>Mostrar</span>

              <CFormSelect
                style={{ width: 90 }}
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </CFormSelect>

              <span>registros</span>
            </div>
          )}
        </div>
      )}

      {/* ================= DESKTOP ================= */}
      {!isMobile && (
        <CTable align="middle" className="mb-0 border table-no-select" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary text-center">#</CTableHeaderCell>

              {columns.map((col) => (
                <CTableHeaderCell
                  key={col.key}
                  // className="text-center"
                  style={{
                    backgroundColor: col.headerBg || '#f8f9fa',
                    color: col.headerColor || '#000',
                  }}
                >
                  {col.label}
                </CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {paginatedData.map((row, index) => (
              <CTableRow key={row.id ?? index}>
                <CTableDataCell>
                  {showPagination ? startIndex + index + 1 : index + 1}
                </CTableDataCell>

                {columns.map((col) => (
                  <CTableDataCell key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </CTableDataCell>
                ))}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      {/* ================= MOBILE ================= */}
      {isMobile &&
        paginatedData.map((row, index) => (
          <CCard key={row.id ?? index} className="mb-3 shadow-sm">
            <CCardBody>
              {/* <div className="d-flex justify-content-between mb-2">
                <strong>#{showPagination ? startIndex + index + 1 : index + 1}</strong>
              </div> */}
              <div className="d-flex justify-content-between mb-2">
                <strong>
                  {columns.find((c) => c.mobileTitle)
                    ? columns
                        .find((c) => c.mobileTitle)
                        .mobileTitle(row, showPagination ? startIndex + index + 1 : index + 1)
                    : `#${showPagination ? startIndex + index + 1 : index + 1}`}
                </strong>
              </div>

              {columns
              .filter(col => !col.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="d-flex justify-content-between mb-1">
                  <span style={{ color: '#777' }}>{col.label}</span>

                  <strong style={{ textAlign: 'right' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </strong>
                </div>
              ))}
            </CCardBody>
          </CCard>
        ))}

      {/* ================= PAGINACIÓN ================= */}
      {showPagination && (
        <div
          className={`mt-3 ${
            isMobile
              ? 'd-flex justify-content-center'
              : 'd-flex justify-content-between align-items-center'
          }`}
        >
          {!isMobile && (
            <div>
              Mostrando {startIndex + 1} a {Math.min(endIndex, totalRecords)} de {totalRecords}{' '}
              registros
            </div>
          )}

          <div className="d-flex gap-1">
            <CButton
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
            >
              ‹
            </CButton>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(currentPage - 2, 0), Math.min(currentPage + 1, totalPages))
              .map((number) => (
                <CButton
                  key={number}
                  size="sm"
                  color={number === currentPage ? 'primary' : 'light'}
                  onClick={() => changePage(number)}
                >
                  {number}
                </CButton>
              ))}

            <CButton
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => changePage(currentPage + 1)}
            >
              ›
            </CButton>
          </div>
        </div>
      )}
    </>
  )
}

export default SmartTable
