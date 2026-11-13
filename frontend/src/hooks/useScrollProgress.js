import { useEffect } from 'react'

// Écrit --scroll-progress (de 0 à 1) sur l'élément pendant le défilement.
export function useScrollProgress(ref, distance = 80) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frame = 0

    function update() {
      frame = 0
      const progress = Math.min(Math.max(window.scrollY / distance, 0), 1)
      element.style.setProperty('--scroll-progress', progress.toFixed(3))
    }

    function onScroll() {
      // Au plus une mise à jour par image affichée
      if (!frame) frame = requestAnimationFrame(update)
    }

    update() // état correct dès le chargement, même si la page est déjà défilée
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ref, distance])
}