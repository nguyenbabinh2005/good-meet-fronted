import { CalendarDays, LogOut, Settings, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { signedOut } from '../../features/authentication/model/auth.slice'
import { LanguageSwitcher } from '../../shared/ui/language-switcher'

export const AppLayout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const auth = useAppSelector((state) => state.auth)

  // The backend keeps no session (no JWT), so signing out only forgets the identity in this browser.
  const signOut = async () => {
    dispatch(signedOut())
    await navigate('/', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand" to="/">
          <img src="/good-meet-mark.svg" alt="" />
          <span>Good Meet</span>
        </Link>
        <nav aria-label="Main navigation" className="app-navigation">
          {auth.status === 'authenticated' && (
            <Link to="/meetings" aria-label={t('navigation.meetings')}>
              <CalendarDays size={19} />
            </Link>
          )}
          <Link to="/settings" aria-label={t('navigation.settings')}>
            <Settings size={19} />
          </Link>
          <LanguageSwitcher />
          {auth.status === 'authenticated' && auth.user ? (
            <div className="header-account">
              <span className="header-user">
                <UserRound aria-hidden="true" size={17} />
                <span>{auth.user.displayName}</span>
              </span>
              <button aria-label={t('common.signOut')} onClick={() => void signOut()} type="button">
                <LogOut aria-hidden="true" size={18} />
              </button>
            </div>
          ) : (
            <Link className="header-sign-in" to="/login">
              {t('common.signIn')}
            </Link>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
