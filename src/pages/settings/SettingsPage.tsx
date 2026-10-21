import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { rememberDisplayName } from '../../features/authentication/model/auth-storage'
import { displayNameChanged } from '../../features/authentication/model/auth.slice'
import { LanguageSwitcher } from '../../shared/ui/language-switcher'
import { Button } from '../../shared/ui/button'

const SettingsPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [name, setName] = useState(user?.displayName ?? '')
  const [saved, setSaved] = useState(false)

  const save = () => {
    const next = name.trim()
    if (!user || !next) return
    rememberDisplayName(user.email, next)
    dispatch(displayNameChanged(next))
    setSaved(true)
  }

  return (
    <section className="page-card settings-page">
      <p className="eyebrow">{t('settings.eyebrow')}</p>
      <h1>{t('settings.title')}</h1>

      <div className="room-field">
        <label htmlFor="settings-name">{t('authentication.displayName')}</label>
        <div className="invite-form">
          <div className="room-input-shell">
            <input
              id="settings-name"
              maxLength={100}
              onChange={(event) => {
                setName(event.target.value)
                setSaved(false)
              }}
              value={name}
            />
          </div>
          <Button disabled={!name.trim() || name.trim() === user?.displayName} onClick={save}>
            {t('settings.save')}
          </Button>
        </div>
        <p className="detail-hint">{saved ? t('settings.saved') : t('settings.nameHint')}</p>
      </div>

      <div className="room-field">
        <span className="settings-label">{t('common.language')}</span>
        <LanguageSwitcher />
      </div>

      {user && <p className="detail-hint">{user.email}</p>}
    </section>
  )
}

export default SettingsPage
