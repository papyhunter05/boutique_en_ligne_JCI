import {
  IconLayoutDashboard,
  IconClipboardList,
  IconPackage,
  IconCategory,
  IconBuildingWarehouse,
  IconUsers,
  IconShoppingCart,
} from '../components/ui/tablerIcons'

// enabled: false → l'entrée est grisée avec « Bientôt ».
// Passer à true quand la page correspondante existe.
export const ADMIN_NAV = [
  { path: '/admin', label: 'Vue ensemble', icon: IconLayoutDashboard, enabled: true, end: true },
  { path: '/admin/commandes', label: 'Commandes', icon: IconClipboardList, enabled: false },
  { path: '/admin/produits', label: 'Produits', icon: IconPackage, enabled: true },
  { path: '/admin/categories', label: 'Catégories', icon: IconCategory, enabled: true },
  { path: '/admin/stock', label: 'Stock', icon: IconBuildingWarehouse, enabled: true },
  { path: '/admin/clients', label: 'Clients', icon: IconUsers, enabled: false },
  { path: '/admin/paniers', label: 'Paniers', icon: IconShoppingCart, enabled: false },
]

// Entrée correspondant à l'URL courante (la plus précise l'emporte)
export function findNavItem(pathname) {
  return ADMIN_NAV.filter(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  ).sort((a, b) => b.path.length - a.path.length)[0]
}