import { useTranslation } from 'react-i18next'
import { MinutesView } from './MinutesView.tsx'

type MinutesCardProps = { code: string; userId: string }

export const MinutesCard = ({ code, userId }: MinutesCardProps) => {
  const { t } = useTranslation()

  return (
    <section aria-labelledby="minutes-title" className="detail-card">
      <h2 id="minutes-title">{t('minutes.title')}</h2>
      <p className="detail-hint">{t('minutes.cardHint')}</p>
      <MinutesView code={code} userId={userId} />
    </section>
  )
}
