import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../hooks/useNotification'
import { http } from '../api/http'
import { getErrorMessage } from '../utils/errors'

export default function DevAuthTestPage() {
  const { user, isLoading, isAuthenticated, isAdmin, login, logout } = useAuth()
  const notify = useNotification()
  const [form, setForm] = useState({ email: '', mot_de_passe: '' })
  const [adminResult, setAdminResult] = useState('')

  async function handleLogin(event) {
    event.preventDefault()
    try {
      const utilisateur = await login(form)
      notify.success(`Connecté : ${utilisateur.prenom} ${utilisateur.nom}`)
    } catch (error) {
      notify.error(getErrorMessage(error))
    }
  }

  async function testAdminRoute() {
    try {
      await http.get('/admin/categories')
      setAdminResult('200 : accès admin autorisé')
    } catch (error) {
      setAdminResult(`Erreur ${error.response?.status ?? 'réseau'}`)
    }
  }

  if (isLoading) return <p style={{ padding: 24 }}>Chargement de la session...</p>

  return (
    <main style={{ padding: 24, display: 'grid', gap: 16, maxWidth: 420 }}>
      <h1>Test authentification (temporaire)</h1>

      {isAuthenticated ? (
        <>
          <p>
            Connecté : {user.prenom} {user.nom} ({user.role}) {isAdmin ? '✅ admin' : '❌ pas admin'}
          </p>
          <button onClick={testAdminRoute}>Tester GET /admin/categories</button>
          {adminResult && <p>Résultat : {adminResult}</p>}
          <button onClick={logout}>Se déconnecter</button>
        </>
      ) : (
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 8 }}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={form.mot_de_passe}
            onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
            required
          />
          <button type="submit">Se connecter</button>
        </form>
      )}
    </main>
  )
}