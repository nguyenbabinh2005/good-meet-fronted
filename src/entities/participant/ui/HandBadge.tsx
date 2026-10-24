import { Hand } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from './HandBadge.module.scss'

type HandBadgeProps = {
  raised?: boolean
}

export const HandBadge = ({ raised = false }: HandBadgeProps) => {
  const { t } = useTranslation()

  if (!raised) return null

  return <Hand aria-label={t('presence.handRaised')} className={styles.hand} role="img" size={16} />
}
