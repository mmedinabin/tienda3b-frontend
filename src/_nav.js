import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilLayers } from '@coreui/icons'
import {
  cilSpeedometer,
  cilUser,
  cilPeople,
  cilBasket,
  cilCart,
  cilCash,
  cilTransfer,
  cilFile,
} from '@coreui/icons'

import { CNavItem, CNavGroup, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} className="nav-icon" />,
    permiso: 'dashboard',
  },

  {
    component: CNavTitle,
    name: 'Operaciones',
  },

  {
    component: CNavItem,
    name: 'Ventas - POS',
    to: '/ventas', // ✅ POS
    icon: <CIcon icon={cilCash} className="nav-icon" />,
    permiso: 'ventas',
  },
  {
    component: CNavItem,
    name: 'Lista - Ventas',
    to: '/historialventas', // ✅ Historial
    icon: <CIcon icon={cilCash} className="nav-icon" />,
    permiso: 'ventas',
  },
  {
    component: CNavGroup,
    name: 'Compras',
    icon: <CIcon icon={cilCart} className="nav-icon" />,
    permiso: 'compras',
    items: [
      {
        component: CNavItem,
        name: 'Listado / Historial',
        to: '/compras',
        permiso: 'compras_ver',
      },
      {
        component: CNavItem,
        name: 'Nueva compra',
        to: '/compras/nuevo',
        permiso: 'compras_crear',
      },
    ],
  },

  // {
  //   component: CNavItem,
  //   name: 'Transferencias',
  //   to: '/transferencias',
  //   icon: <CIcon icon={cilTransfer} className="nav-icon" />,
  //   permiso: 'transferencias',
  // },

  {
    component: CNavTitle,
    name: 'Inventario',
  },

  {
    component: CNavItem,
    name: 'Productos',
    to: '/productos',
    icon: <CIcon icon={cilBasket} className="nav-icon" />,
    permiso: 'productos',
  },

  {
    component: CNavItem,
    name: 'Stock Inventario',
    to: '/stock',
    icon: <CIcon icon={cilLayers} className="nav-icon" />,
    permiso: 'stock_ver',
  },

    {
    component: CNavItem,
    name: 'Movimientos',
    to: '/movimientos',
    icon: <CIcon icon={cilTransfer} className="nav-icon" />,
    permiso: 'movimientos',
  },
  //    {
  //   component: CNavItem,
  //   name: 'Ajutes',
  //   to: '/transferencias',
  //   icon: <CIcon icon={cilTransfer} className="nav-icon" />,
  //   permiso: 'transferencias',
  // },



  {
    component: CNavTitle,
    name: 'Reportes',
  },

  {
    component: CNavGroup,
    name: 'Reportes',
    icon: <CIcon icon={cilFile} className="nav-icon" />,
    permiso: 'reportes',
    items: [
      {
        component: CNavItem,
        name: 'Ventas',
        to: '/reportes/ventas',
        permiso: 'reportes_ventas',
      },
      {
        component: CNavItem,
        name: 'Compras',
        to: '/reportes/compras',
        permiso: 'reportes_compras',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Gestión',
  },

  {
    component: CNavItem,
    name: 'Usuarios',
    to: '/usuarios',
    icon: <CIcon icon={cilUser} className="nav-icon" />,
    permiso: 'usuarios',
  },
  {
    component: CNavItem,
    name: 'Empleados',
    to: '/empleados',
    icon: <CIcon icon={cilUser} className="nav-icon" />,
    permiso: 'empleados',
  },

  {
    component: CNavItem,
    name: 'Proveedores',
    to: '/proveedores',
    icon: <CIcon icon={cilPeople} className="nav-icon" />,
    permiso: 'proveedores',
  },
  {
    component: CNavItem,
    name: 'Clientes',
    to: '/clientes',
    icon: <CIcon icon={cilPeople} className="nav-icon" />,
    permiso: 'Clientes',
  },
  {
    component: CNavItem,
    name: 'Sucursales',
    to: '/sucursales',
    icon: <CIcon icon={cilCash} className="nav-icon" />,
    permiso: 'sucursales',
  },
]

export default _nav
