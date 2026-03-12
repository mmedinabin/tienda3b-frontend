import React from 'react'
import ProtectedRoute from './components/ProtectedRoute'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const Usuarios = React.lazy(() => import('./views/usuarios/Usuarios'))
const UsuarioForm = React.lazy(() => import('./views/usuarios/UsuarioForm'))
const Sucursales = React.lazy(() => import('./views/sucursales/Sucursales'))
const Clientes = React.lazy(() => import('./views/clientes/Clientes'))
const Proveedores = React.lazy(() => import('./views/proveedores/Proveedores'))
const Productos = React.lazy(() => import('./views/productos/Productos'))
const ProductoForm = React.lazy(() => import('./views/productos/ProductoForm'))
const Empleados = React.lazy(() => import('./views/empleados/Empleados'))
const EmpleadoForm = React.lazy(() => import('./views/empleados/EmpleadoForm'))
const Compras = React.lazy(() => import('./views/compras/Compras'))
const CompraNueva = React.lazy(() => import('./views/compras/CompraNueva'))
const POSPage = React.lazy(() => import('./views/ventas/POSPage'))
const Ventas = React.lazy(() => import('./views/ventas/Ventas'))
const Movimientos = React.lazy(() => import('./views/movimientos/Movimientos'))
const MovimientosForm = React.lazy(() => import('./views/movimientos/MovimientosForm'))
const Stock = React.lazy(() => import('./views/stock/StockInventario'))
const RptVentas = React.lazy(() => import('./views/reportes/RptVentas'))
const RptCompras = React.lazy(() => import('./views/reportes/RptCompras'))
const NuevaDistribucion = React.lazy(() => import('./views/distribucion/NuevaDistribucion'))

const NoAutorizado = React.lazy(() => import('./views/pages/NoAutorizado'))

const routes = [
  {
    path: '/',
    element: Dashboard,
    modulo: 'DASHBOARD',
    accion: 'ver',
  },
  {
    path: '/dashboard',
    element: Dashboard,
    modulo: 'DASHBOARD',
    accion: 'ver',
  },
  { path: '/', exact: true, name: 'Home' },
  {
    path: '/sucursales',
    name: 'Sucursales',
    element: Sucursales,
    modulo: 'SUCURSALES',
    accion: 'ver',
  },

  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },

  {
    path: '/usuarios',
    name: 'Usuarios',
    element: Usuarios,
    modulo: 'usuarios',
    accion: 'ver',
  },

  { path: '/usuarios/nuevo', element: UsuarioForm, modulo: 'usuarios', accion: 'crear' },
  { path: '/usuarios/:id/editar', element: UsuarioForm, modulo: 'usuarios', accion: 'editar' },
  {
    path: '/clientes',
    name: 'Clientes',
    element: Clientes,
    modulo: 'clientes',
    accion: 'crear',
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    element: Proveedores,
    modulo: 'proveedores',
    accion: 'ver',
  },
  {
    path: '/productos',
    name: 'Productos',
    element: Productos,
    modulo: 'productos',
    accion: 'ver',
  },
  { path: '/productos/nuevo', element: ProductoForm, modulo: 'productos', accion: 'crear' },
  { path: '/productos/editar/:id', element: ProductoForm, modulo: 'productos', accion: 'editar' },
  {
    path: '/empleados',
    name: 'Empleados',
    element: Empleados,
    modulo: 'empleados',
    accion: 'ver',
  },
  { path: '/empleados/nuevo', element: EmpleadoForm, modulo: 'empleados', accion: 'crear' },
  { path: '/empleados/editar/:id', element: EmpleadoForm, modulo: 'empleados', accion: 'editar' },

  {
    path: '/compras',
    name: 'Compras',
    element: Compras,
    modulo: 'compras',
    accion: 'ver',
  },
  { path: '/compras/nuevo', element: CompraNueva, modulo: 'compras', accion: 'editar' },
  {
    path: '/ventas',
    name: 'Ventas',
    element: POSPage,
    modulo: 'ventas',
    accion: 'crear',
  },
  {
    path: '/historialventas',
    name: 'Ventas',
    element: Ventas,
    modulo: 'ventas',
    accion: 'ver',
  },
    {
    path: '/distribucion/nuevo',
    name: 'Distribucion',
    element: NuevaDistribucion,
    modulo: 'ventas',
    accion: 'crear',
  },
  {
    path: '/movimientos',
    name: 'Movimientos',
    element: Movimientos,
    modulo: 'movimientos',
    accion: 'ver',
  },
  {
    path: '/movimientos/nuevo',
    name: 'Movimientos',
    element: MovimientosForm,
    modulo: 'movimientos',
    accion: 'crear',
  },
  {
    path: '/reportes/ventas',
    name: 'RptVentas',
    element: RptVentas,
    modulo: 'reportes',
    accion: 'ver',
  },
  {
    path: '/reportes/compras',
    name: 'RptCompras',
    element: RptCompras,
    modulo: 'reportes',
    accion: 'ver',
  },
  {
    path: '/403',
    name: 'No Autorizado',
    element: NoAutorizado,
  },
  {
    path: '/stock',
    name: 'Stock',
    element: Stock,
  },
]

export default routes
