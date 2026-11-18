export const ROLES = {
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
}

// ADMIN et SUPER_ADMIN ont accès à l'espace d'administration
export function isStaffRole(role) {
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
}

export function isSuperAdminRole(role) {
  return role === ROLES.SUPER_ADMIN
}

export const ROLE_LABELS = {
  CLIENT: 'Client',
  ADMIN: 'Administrateur',
  SUPER_ADMIN: 'Super administrateur',
}

// success | warning | info | neutral | danger
export const ROLE_TONES = {
  CLIENT: 'neutral',
  ADMIN: 'info',
  SUPER_ADMIN: 'warning',
}

export function isClientRole(role) {
  return role === ROLES.CLIENT
}