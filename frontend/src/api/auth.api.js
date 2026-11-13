import { http } from './http'

export async function login({ email, mot_de_passe }) {
  const { data } = await http.post(
    '/auth/login',
    { email, mot_de_passe },
    { skipAuthHandling: true },
  )
  return { token: data.token, utilisateur: data.utilisateur }
}

// Retourne la réponse brute : on ne connaît pas encore son format exact
export async function register(payload) {
  const { data } = await http.post('/auth/register', payload, { skipAuthHandling: true })
  return data
}

export async function getMe() {
  const { data } = await http.get('/auth/me', { skipAuthHandling: true })
  return data.utilisateur
}

export async function logout() {
  await http.post('/auth/logout', null, { skipAuthHandling: true })
}