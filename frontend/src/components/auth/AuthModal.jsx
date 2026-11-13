import Modal from '../ui/Modal'
import Logo from '../common/Logo'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import styles from './AuthModal.module.css'

const TEXTS = {
  login: {
    title: 'Connexion',
    subtitle: 'Connectez-vous avec votre adresse email pour accéder à votre compte.',
    switchQuestion: 'Pas encore de compte ?',
    switchAction: 'Créer un compte',
    switchTo: 'register',
  },
  register: {
    title: 'Créer un compte',
    subtitle: 'Renseignez vos informations pour pouvoir passer vos commandes.',
    switchQuestion: 'Vous avez déjà un compte ?',
    switchAction: 'Se connecter',
    switchTo: 'login',
  },
}

export default function AuthModal({ isOpen, mode, onModeChange, onClose, onSuccess }) {
  const text = TEXTS[mode]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      padded={false}
      ariaLabel={text.title}
    >
      <div className={styles.layout}>
        <aside className={styles.brand}>
          <Logo />
        </aside>

        <div className={styles.panel}>
          <div>
            <h2 className={styles.title}>{text.title}</h2>
            <p className={styles.subtitle}>{text.subtitle}</p>
          </div>

          {/* key : le formulaire repart vide quand on change de mode */}
          {mode === 'login' ? (
            <LoginForm key="login" onSuccess={onSuccess} />
          ) : (
            <RegisterForm key="register" onSuccess={onSuccess} />
          )}

          <p className={styles.switch}>
            {text.switchQuestion}{' '}
            <button
              type="button"
              className={styles.link}
              onClick={() => onModeChange(text.switchTo)}
            >
              {text.switchAction}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  )
}