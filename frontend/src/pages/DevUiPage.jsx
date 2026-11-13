import { useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { formatPrix } from '../utils/format'

const row = { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }

export default function DevUiPage() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  function fakeLoad() {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <main style={{ padding: 24, display: 'grid', gap: 24, maxWidth: 720 }}>
      <h1>Composants UI (page temporaire)</h1>

      <section style={row}>
        <Button>Primary</Button>
        <Button variant="dark">Dark</Button>
        <Button variant="success">Success</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="soft" pill>Soft pill</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Désactivé</Button>
        <Button size="sm">Petit</Button>
        <Button size="lg">Grand</Button>
        <Button variant="success" loading={loading} onClick={fakeLoad}>
          Chargement
        </Button>
      </section>

      <section style={{ display: 'grid', gap: 12, maxWidth: 320 }}>
        <Input label="Email" type="email" placeholder="vous@exemple.com" />
        <Input label="Mot de passe" type="password" />
        <Input label="Avec erreur" error="Adresse email ou mot de passe incorrect." />
        <Input label="Avec aide" hint="Texte d'aide sous le champ" />
      </section>

      <section style={row}>
        <StatusBadge tone="success">Actif</StatusBadge>
        <StatusBadge tone="neutral">Inactif</StatusBadge>
        <StatusBadge tone="warning">À traiter</StatusBadge>
        <StatusBadge tone="info">En préparation</StatusBadge>
        <StatusBadge tone="danger">Erreur</StatusBadge>
      </section>

      <section>
        <p>
          {formatPrix(25)} · {formatPrix('300.00')} · {formatPrix(30000)} ·{' '}
          {formatPrix('1250.5')} · {formatPrix(null)}
        </p>
      </section>

      <section>
        <Button onClick={() => setOpen(true)}>Ouvrir la modale</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Exemple de modale" size="sm">
          <p>Échap, la croix et le clic sur le fond ferment la modale.</p>
        </Modal>
      </section>
    </main>
  )
}