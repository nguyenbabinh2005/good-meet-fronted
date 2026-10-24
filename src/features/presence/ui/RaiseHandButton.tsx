import { Hand } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../../app/store'
import { useSetHandMutation } from '../api/presence.api'

type RaiseHandButtonProps = {
  activeClassName: string
  code: string
  participantId: string
}

export const RaiseHandButton = ({ activeClassName, code, participantId }: RaiseHandButtonProps) => {
  const { t } = useTranslation()
  const raised = useAppSelector((state) =>
    state.presence.raised.some((hand) => hand.participantId === participantId),
  )
  const mutation = useSetHandMutation()

  return (
    <button
      aria-pressed={raised}
      className={raised ? activeClassName : ''}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate({ code, participantId, raised: !raised })}
      type="button"
    >
      <Hand size={20} />
      <span>{raised ? t('presence.lowerHand') : t('presence.raiseHand')}</span>
    </button>
  )
}
