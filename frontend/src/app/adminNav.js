import {
  IconLayoutDashboard,
  IconClipboardList,
  IconPackage,
  IconCategory,
  IconBuildingWarehouse,
  IconUsers,
  IconShoppingCart,
  IconTruckDelivery,
  IconMapPin,
} from '../components/ui/tablerIcons'

// enabled: false → l'entrée est grisée avec « Bientôt ».
// superAdminOnly: true → l'entrée n'est visible que pour le SUPER_ADMIN.
export const ADMIN_NAV = [
  { path: '/admin', label: 'Vue ensemble', icon: IconLayoutDashboard, enabled: true, end: true },
  { path: '/admin/commandes', label: 'Commandes', icon: IconClipboardList, enabled: true },
  { path: '/admin/livraisons', label: 'Livraisons', icon: IconTruckDelivery, enabled: true },
  { path: '/admin/produits', label: 'Produits', icon: IconPackage, enabled: true },
  { path: '/admin/categories', label: 'Catégories', icon: IconCategory, enabled: true },
  { path: '/admin/stock', label: 'Stock', icon: IconBuildingWarehouse, enabled: true },
  { path: '/admin/agences', label: 'Agences', icon: IconMapPin, enabled: true },
  {
    path: '/admin/utilisateurs',
    label: 'Utilisateurs',
    icon: IconUsers,
    enabled: true,
    superAdminOnly: true,
  },
  { path: '/admin/paniers', label: 'Paniers', icon: IconShoppingCart, enabled: false },
]

// Entrée correspondant à l'URL courante (la plus précise l'emporte)
export function findNavItem(pathname) {
  return ADMIN_NAV.filter(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  ).sort((a, b) => b.path.length - a.path.length)[0]
}