import { useEffect, useState, forwardRef } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormSelect,
  CFormInput,
  CButton,
  CRow,
  CCol,
} from "@coreui/react";
import Swal from "sweetalert2";
import Select from "react-select";
import {
  CInputGroup,
  CInputGroupText,
  CFormLabel,
  CCollapse,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCalendar } from "@coreui/icons";
import { useRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { reactSelectStyles } from "../../styles/reactSelect";
import { productosService } from "../../services/productos.service";
import { movimientosService } from "../../services/movimientos.service";

const MovimientosForm = () => {
  const [tipoMovimiento, setTipoMovimiento] = useState("ENTRADA_INICIAL");
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    precio_venta: "",
    fecha_vencimiento: "",
  });

  const [detalleTemp, setDetalleTemp] = useState({
    producto_id: "",
    cantidad: 0, // 🔥 inicia en 0
    costo_unitario: "",
    precio_venta: "",
    fecha_vencimiento: "",
    stock: 0,
  });

  const [detalles, setDetalles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // =========================
  // 📦 CARGAR PRODUCTOS
  // =========================
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await productosService.listar();
        setProductos(res.data.data);
      } catch (error) {
        Swal.fire("Error", "No se pudieron cargar los productos", "error");
      }
    };

    fetchProductos();
  }, []);

  // =========================
  // 📝 HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const agregarProducto = () => {
    const cantidad = Number(detalleTemp.cantidad);
    const costo = Number(detalleTemp.costo_unitario);
    const precio = Number(detalleTemp.precio_venta);

    if (!detalleTemp.producto_id) {
      Swal.fire("Error", "Debe seleccionar un producto", "warning");
      return;
    }

    if (cantidad <= 0) {
      Swal.fire("Error", "La cantidad debe ser mayor a 0", "warning");
      return;
    }

    if (costo <= 0) {
      Swal.fire("Error", "El costo debe ser mayor a 0", "warning");
      return;
    }

    if (precio <= 0) {
      Swal.fire("Error", "El precio debe ser mayor a 0", "warning");
      return;
    }

    if (precio <= costo) {
      Swal.fire(
        "Error",
        "El precio de venta debe ser mayor al costo",
        "warning",
      );
      return;
    }

    const productoSeleccionado = productos.find(
      (p) => p.id === detalleTemp.producto_id,
    );

    if (!productoSeleccionado) return;

    const nuevoDetalle = {
      ...detalleTemp,
      cantidad,
      costo_unitario: costo,
      precio_venta: precio,
      producto_nombre: productosOptions.find(
        (o) => o.value === detalleTemp.producto_id,
      )?.label,
    };

    setDetalles((prev) => [...prev, nuevoDetalle]);

    // Reset
    setDetalleTemp({
      producto_id: "",
      cantidad: 0,
      costo_unitario: "",
      precio_venta: "",
      fecha_vencimiento: "",
      stock: 0,
    });
  };

  const eliminarProducto = (index) => {
    const nuevos = [...detalles];
    nuevos.splice(index, 1);
    setDetalles(nuevos);
  };

  // =========================
  // 🚀 SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (detalles.length === 0)
      return Swal.fire("Error", "Debe agregar al menos un producto", "error");
    try {
      setLoading(true);

      await movimientosService.cargaInicial({
        detalles: detalles.map((d) => ({
          producto_id: Number(d.producto_id),
          cantidad: Number(d.cantidad),
          costo_unitario: Number(d.costo_unitario),
          precio_venta: d.precio_venta ? Number(d.precio_venta) : null,
          fecha_vencimiento: d.fecha_vencimiento || null,
        })),
      });

      Swal.fire("Éxito", "Movimiento registrado correctamente", "success");

      setDetalles([]);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const productosOptions = productos.map((p) => ({
    value: p.id,
    label: p.marca ? `${p.marca} - ${p.nombre}` : p.nombre,
    producto: p,
  }));

  const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <input
      type="text"
      className="form-control"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      ref={ref}
      readOnly
    />
  ));

  const datePickerRef = useRef(null);
  registerLocale("es", es);

  return (
    <CCard>
      <CCardHeader>
        <strong>Movimientos de Inventario</strong>
      </CCardHeader>

      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          {/* ========================= */}
          {/* 🔄 TIPO MOVIMIENTO */}
          {/* ========================= */}
          <CRow className="mb-3">
            <CCol md={6} className="modern-label modern-input">
              <CFormSelect
                label="Tipo de Movimiento"
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value)}
              >
                <option value="CARGA_INICIAL">Ingreso Stock Inicial</option>
              </CFormSelect>
            </CCol>
          </CRow>

          {/* ========================= */}
          {/* 📦 CARGA INICIAL */}
          {/* ========================= */}

          {tipoMovimiento === "ENTRADA_INICIAL" && (
            <>
              {/* 📱 MOBILE */}
              <div className="d-block d-md-none">
                {/* 🔘 BOTÓN COLLAPSE */}
                <CButton
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="w-100 mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(25, 135, 84, 0.12)", // verde suave
                    border: "1px solid rgba(25, 135, 84, 0.35)",
                    color: "#198754",
                    fontWeight: 600,
                    borderRadius: "12px",
                    padding: "12px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>
                    {showAddForm ? "−" : "+"}
                  </span>

                  {showAddForm ? "Ocultar formulario" : "Añadir producto"}
                </CButton>

                <CCollapse visible={showAddForm}>
                  <CCard
                    className="mb-3 shadow-sm border-0"
                    style={{
                      borderRadius: "18px",
                      backgroundColor: "#f8f9ff",
                    }}
                  >
                    <CCardBody className="modern-input modern-label">
                      <CRow className="g-3">
                        {/* PRODUCTO */}
                        <CCol xs={12}>
                          <label className="modern-label">Producto</label>
                          <Select
                            options={productosOptions}
                            value={
                              productosOptions.find(
                                (o) => o.value === detalleTemp.producto_id,
                              ) || null
                            }
                            onChange={(selected) => {
                              if (!selected) {
                                setDetalleTemp({
                                  ...detalleTemp,
                                  producto_id: "",
                                  precio_venta: "",
                                  stock: 0,
                                });
                                return;
                              }

                              const producto = selected.producto;

                              setDetalleTemp({
                                ...detalleTemp,
                                producto_id: producto.id,
                                precio_venta: producto.precio_venta,
                                stock: Number(producto.stock),
                              });
                            }}
                            placeholder="Buscar producto..."
                            isClearable
                          />
                        </CCol>

                        {/* CANTIDAD */}
                        <CCol xs={12}>
                          <CFormInput
                            type="number"
                            label="Cantidad"
                            value={detalleTemp.cantidad}
                            onChange={(e) =>
                              setDetalleTemp({
                                ...detalleTemp,
                                cantidad: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor: "var(--cui-body-bg)",
                              color: "var(--cui-body-color)",
                            }}
                          />
                        </CCol>

                        {/* COSTO */}
                        <CCol xs={12}>
                          <CFormInput
                            type="number"
                            step="0.01"
                            label="Costo unitario"
                            value={detalleTemp.costo_unitario}
                            onChange={(e) =>
                              setDetalleTemp({
                                ...detalleTemp,
                                costo_unitario: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor: "var(--cui-body-bg)",
                              color: "var(--cui-body-color)",
                            }}
                          />
                        </CCol>

                        {/* PRECIO VENTA */}
                        <CCol xs={12}>
                          <CFormInput
                            type="number"
                            step="0.01"
                            label="Precio de venta"
                            value={detalleTemp.precio_venta}
                            onChange={(e) =>
                              setDetalleTemp({
                                ...detalleTemp,
                                precio_venta: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor: "var(--cui-body-bg)",
                              color: "var(--cui-body-color)",
                            }}
                          />
                        </CCol>

                        <CCol xs={12}>
                          <CFormLabel className="modern-label">
                            Fecha de venc (opcional)
                          </CFormLabel>
                          <DatePicker
                            locale="es"
                            selected={
                              detalleTemp.fecha_vencimiento
                                ? new Date(detalleTemp.fecha_vencimiento)
                                : null
                            }
                            onChange={(date) =>
                              setDetalleTemp({
                                ...detalleTemp,
                                fecha_vencimiento: date
                                  ? format(date, "yyyy-MM-dd")
                                  : "",
                              })
                            }
                            dateFormat="dd/MM/yyyy"
                            className="form-control w-100"
                            wrapperClassName="w-100"
                            placeholderText="Seleccionar fecha"
                          />
                        </CCol>

                        {/* BOTÓN */}
                        <CCol xs={12}>
                          <CButton
                            onClick={() => {
                              agregarProducto();
                              setShowAddForm(false);
                            }}
                            className="w-100 fw-semibold"
                            style={{
                              background:
                                "linear-gradient(135deg, #22c55e, #16a34a)",
                              border: "none",
                              borderRadius: "14px",
                              padding: "12px",
                              fontSize: "0.95rem",
                              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
                              transition: "all 0.15s ease",
                            }}
                            onMouseDown={(e) =>
                              (e.currentTarget.style.transform = "scale(0.98)")
                            }
                            onMouseUp={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          >
                            + Agregar al carrito
                          </CButton>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCollapse>

                {detalles.map((item, index) => (
                  <CCard
                    key={index}
                    className="mb-3 border-0 shadow-sm"
                    style={{
                      borderRadius: "14px",
                      overflow: "hidden",
                      backgroundColor: "#f3f4f7",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <CCardBody>
                      {/* 1️⃣ LABEL */}
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          lineHeight: "1.2rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}
                      >
                        <span
                          style={{
                            color: "#6c757d",
                            marginRight: "6px",
                          }}
                        >
                          #{index + 1}
                        </span>
                        {item.producto_nombre}
                      </div>

                      {/* 2️⃣ COSTO + CANTIDAD */}
                      <div className="mt-3">
                        <div className="d-flex justify-content-between">
                          {/* COSTO */}
                          <div>
                            <div className="small text-muted mb-1">Costo</div>
                            <div
                              style={{
                                fontSize: "1.05rem",
                                fontWeight: 700,
                                color: "#111",
                              }}
                            >
                              Bs {Number(item.costo_unitario).toFixed(2)}
                            </div>
                          </div>

                          {/* CANTIDAD */}
                          <div style={{ textAlign: "center" }}>
                            <div className="small text-muted mb-1">Cant.</div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "1rem",
                              }}
                            >
                              {item.cantidad}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3️⃣ PRECIO VENTA + VENCIMIENTO */}
                      <div className="mt-3 small text-muted">
                        Venta:{" "}
                        {item.precio_venta
                          ? `Bs ${Number(item.precio_venta).toFixed(2)}`
                          : "-"}
                        <br />
                        Vence:{" "}
                        {item.fecha_vencimiento
                          ? format(
                              new Date(item.fecha_vencimiento),
                              "dd/MM/yyyy",
                            )
                          : "-"}
                      </div>

                      {/* 4️⃣ TOTAL + ELIMINAR */}
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="fw-semibold">
                          SubTotal: Bs{" "}
                          {(item.cantidad * item.costo_unitario).toFixed(2)}
                        </div>

                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={() => eliminarProducto(index)}
                        >
                          Quitar
                        </CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                ))}
              </div>

              {/* 🔘 BOTÓN FIJO MOBILE */}
              <div
                className="d-md-none position-fixed bottom-0 start-0 w-100"
                style={{
                  zIndex: 1050,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(6px)",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <CButton
                  type="submit"
                  disabled={loading}
                  className="w-100 fw-bold"
                  style={{
                    backgroundColor: "var(--cui-primary)",
                    border: "none",
                    borderRadius: "16px",
                    padding: "15px",
                    fontSize: "1.05rem",
                    letterSpacing: "0.3px",
                    boxShadow: "0 6px 16px rgba(111, 66, 193, 0.35)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.98)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {loading ? "Guardando..." : "Guardar Movimiento"}
                </CButton>
              </div>

              {/* 🖥 DESKTOP */}
              <div className="d-none d-lg-block">
                <CRow>
                  <CCol md={4} className="mb-3">
                    <div className="d-flex justify-content-between align-items-end mb-1">
                      <label className="form-label mb-0">Producto</label>

                      {detalleTemp.producto_id && (
                        <small
                          className={`fw-bold ${
                            Number(detalleTemp.stock) > 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          Stock: {detalleTemp.stock}
                        </small>
                      )}
                    </div>

                    <Select
                      options={productosOptions}
                      value={
                        productosOptions.find(
                          (o) => o.value === detalleTemp.producto_id,
                        ) || null
                      }
                      onChange={(selected) => {
                        if (!selected) {
                          setDetalleTemp({
                            ...detalleTemp,
                            producto_id: "",
                            precio_venta: "",
                            stock: 0,
                          });
                          return;
                        }

                        const producto = selected.producto;

                        setDetalleTemp({
                          ...detalleTemp,
                          producto_id: producto.id,
                          precio_venta: producto.precio_venta,
                          stock: Number(producto.stock),
                        });
                      }}
                      styles={reactSelectStyles}
                      placeholder="Buscar producto..."
                      isClearable
                    />
                  </CCol>
                  <CCol md={1} className="mb-3">
                    <CFormInput
                      type="number"
                      label="Cant"
                      value={detalleTemp.cantidad}
                      onChange={(e) =>
                        setDetalleTemp({
                          ...detalleTemp,
                          cantidad: e.target.value,
                        })
                      }
                      invalid={Number(detalleTemp.cantidad) === 0}
                    />
                  </CCol>

                  <CCol md={1} className="mb-3">
                    <CFormInput
                      type="number"
                      step="0.01"
                      label="Costo"
                      value={detalleTemp.costo_unitario}
                      onChange={(e) =>
                        setDetalleTemp({
                          ...detalleTemp,
                          costo_unitario: e.target.value,
                        })
                      }
                    />
                  </CCol>

                  <CCol md={2} className="mb-3">
                    <CFormInput
                      type="number"
                      step="0.01"
                      label="P. Venta"
                      value={detalleTemp.precio_venta}
                      onChange={(e) =>
                        setDetalleTemp({
                          ...detalleTemp,
                          precio_venta: e.target.value,
                        })
                      }
                    />
                  </CCol>

                  <CCol md={2} className="mb-3">
                    <CFormLabel>F. Venc</CFormLabel>
                    <DatePicker
                      selected={
                        detalleTemp.fecha_vencimiento
                          ? new Date(detalleTemp.fecha_vencimiento)
                          : null
                      }
                      onChange={(date) =>
                        setDetalleTemp({
                          ...detalleTemp,
                          fecha_vencimiento: date
                            ? format(date, "yyyy-MM-dd")
                            : "",
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      locale="es"
                      minDate={new Date()}
                      className="form-control"
                      placeholderText="Fecha..."
                    />
                  </CCol>
                  <CCol md={2} className="mb-3 d-flex flex-column">
                    <CFormLabel className="invisible">Acción</CFormLabel>
                    <CButton
                      color="success"
                      onClick={agregarProducto}
                      className="w-100 w-md-auto"
                    >
                      Agregar producto
                    </CButton>
                  </CCol>
                </CRow>
                <div className="table-responsive mt-3">
                  <table
                    className="table table-sm align-middle"
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <thead
                      style={{
                        backgroundColor: "#f1f3f7",
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                      }}
                    >
                      <tr>
                        <th
                          style={{ width: "50px" }}
                          className="text-center text-muted"
                        >
                          #
                        </th>
                        <th className="fw-semibold text-muted">Producto</th>
                        <th className="fw-semibold text-muted text-center">
                          Cant.
                        </th>
                        <th className="fw-semibold text-muted text-end">
                          Costo
                        </th>
                        <th className="fw-semibold text-muted text-end">
                          P. Venta
                        </th>
                        <th className="fw-semibold text-muted text-center">
                          F. Venc.
                        </th>
                        <th className="text-center"></th>
                      </tr>
                    </thead>

                    <tbody>
                      {detalles.map((item, index) => (
                        <tr key={index}>
                          {/* NUMERACIÓN */}
                          <td className="text-center fw-semibold text-muted">
                            {index + 1}
                          </td>

                          <td className="fw-medium">{item.producto_nombre}</td>

                          <td className="text-center fw-semibold">
                            {item.cantidad}
                          </td>

                          <td className="text-end">
                            Bs {Number(item.costo_unitario).toFixed(2)}
                          </td>

                          <td className="text-end">
                            {item.precio_venta
                              ? `Bs ${Number(item.precio_venta).toFixed(2)}`
                              : "-"}
                          </td>

                          <td className="text-center">
                            {item.fecha_vencimiento
                              ? format(
                                  new Date(item.fecha_vencimiento),
                                  "dd/MM/yyyy",
                                )
                              : "-"}
                          </td>

                          <td className="text-center">
                            <CButton
                              size="sm"
                              color="danger"
                              variant="outline"
                              onClick={() => eliminarProducto(index)}
                            >
                              Quitar
                            </CButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <CRow className="mt-4">
                  <CCol className="d-flex justify-content-end">
                    <CButton
                      type="submit"
                      color="primary"
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? "Guardando..." : "Registrar Movimiento"}
                    </CButton>
                  </CCol>
                </CRow>
              </div>
            </>
          )}
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default MovimientosForm;
