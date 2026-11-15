import bannerUrl from '../../assets/images/image_home_page.jpg' // ← adapte le nom et l'extension
import FeaturedCarousel from './FeaturedCarousel'
import { useProduits } from '../../hooks/useProduits'
import { useProductSelect } from '../../hooks/useProductSelect'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  // Même clé de cache que la page 1 du catalogue : pas de requête en double
  const { data } = useProduits(1)
  const onSelect = useProductSelect()

const featured = (data?.items ?? []).filter((product) => product.image).slice(0, 5)
  return (
    <section className={`${styles.hero} ${featured.length === 0 ? styles.full : ''}`}>
      <img
        src={bannerUrl}
        alt="Découvrez les articles de notre boutique en ligne JCI Madagascar : vêtements, casquettes, mugs et sacs"
        className={styles.banner}
      />
      {featured.length > 0 && <FeaturedCarousel products={featured} onSelect={onSelect} />}
    </section>
  )
}