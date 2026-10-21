import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm, type UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch } from '../../../app/store'
import { Button } from '../../../shared/ui/button'
import { login, register as registerAccount } from '../api/authentication.api'
import { describeAuthError } from '../model/auth-error'
import { rememberDisplayName, resolveDisplayName } from '../model/auth-storage'
import { signedIn } from '../model/auth.slice'
import { loginFormSchema, registerSchema, type RegisterValues } from '../model/authentication.schema'
import styles from './AuthenticationForm.module.scss'

type AuthenticationMode = 'login' | 'register'
type FormValues = RegisterValues

const authenticationCopyKeys = {
  login: {
    description: 'authentication.loginDescription',
    eyebrow: 'authentication.loginEyebrow',
    prompt: 'authentication.noAccount',
    submit: 'authentication.signIn',
    switchPath: '/register',
    title: 'authentication.loginTitle',
  },
  register: {
    description: 'authentication.registerDescription',
    eyebrow: 'authentication.registerEyebrow',
    prompt: 'authentication.haveAccount',
    submit: 'authentication.createAccount',
    switchPath: '/login',
    title: 'authentication.registerTitle',
  },
} as const

type PasswordFieldProps = {
  autoComplete: 'current-password' | 'new-password'
  errorMessage?: string
  label: string
  name: 'password' | 'confirmPassword'
  onToggle: () => void
  register: UseFormRegister<FormValues>
  toggleLabel: string
  visible: boolean
}

const PasswordField = ({
  autoComplete,
  errorMessage,
  label,
  name,
  onToggle,
  register,
  toggleLabel,
  visible,
}: PasswordFieldProps) => (
  <label>
    <span>{label}</span>
    <span className={styles.inputControl}>
      <LockKeyhole aria-hidden="true" size={18} />
      <input autoComplete={autoComplete} type={visible ? 'text' : 'password'} {...register(name)} />
      <button aria-label={toggleLabel} onClick={onToggle} type="button">
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
    {errorMessage && <small role="alert">{errorMessage}</small>}
  </label>
)

export const AuthenticationForm = ({ mode }: { mode: AuthenticationMode }) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { t } = useTranslation()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [requestError, setRequestError] = useState<string>()
  const isRegister = mode === 'register'
  const copyKeys = authenticationCopyKeys[mode]
  const submitLabel = pending ? t('authentication.processing') : t(copyKeys.submit)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormValues>({
    defaultValues: { confirmPassword: '', displayName: '', email: '', password: '' },
    resolver: zodResolver(isRegister ? registerSchema : loginFormSchema),
  })

  const submit = handleSubmit(async (values) => {
    setRequestError(undefined)
    setPending(true)
    const email = values.email.trim().toLowerCase()
    try {
      if (isRegister) {
        const displayName = values.displayName.trim()
        await registerAccount({ displayName, email, password: values.password })
        rememberDisplayName(email, displayName)
      }
      // Registration answers 201 with no body, so the new user signs in right away to obtain the userId.
      const userId = await login({ email, password: values.password })
      dispatch(signedIn({ displayName: resolveDisplayName(email), email, userId }))
    } catch (error) {
      setRequestError(t(describeAuthError(error)))
    } finally {
      setPending(false)
    }
  })

  return (
    <section className={`authentication-page ${styles.shell}`}>
      <div className={styles.brandPanel}>
        <Link className={styles.brand} to="/">
          <img alt="" src="/good-meet-mark.svg" />
          <span>Good Meet</span>
        </Link>
        <div className={styles.brandCopy}>
          <span className={styles.eyebrow}>{t('authentication.brandEyebrow')}</span>
          <h1>{t('authentication.brandTitle')}</h1>
          <p>{t('authentication.brandDescription')}</p>
        </div>
        <div className={styles.securityNote}>
          <LockKeyhole aria-hidden="true" size={18} />
          <span>{t('authentication.securityNote')}</span>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formHeading}>
          <p>{t(copyKeys.eyebrow)}</p>
          <h2>{t(copyKeys.title)}</h2>
          <span>{t(copyKeys.description)}</span>
        </div>

        <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
          {isRegister && (
            <label>
              <span>{t('authentication.displayName')}</span>
              <span className={styles.inputControl}>
                <UserRound aria-hidden="true" size={18} />
                <input autoComplete="name" {...register('displayName')} />
              </span>
              {errors.displayName?.message && <small role="alert">{t(errors.displayName.message)}</small>}
            </label>
          )}

          <label>
            <span>{t('authentication.email')}</span>
            <span className={styles.inputControl}>
              <Mail aria-hidden="true" size={18} />
              <input autoCapitalize="none" autoComplete="email" inputMode="email" {...register('email')} />
            </span>
            {errors.email?.message && <small role="alert">{t(errors.email.message)}</small>}
          </label>

          <PasswordField
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            errorMessage={errors.password?.message ? t(errors.password.message) : undefined}
            label={t('authentication.password')}
            name="password"
            onToggle={() => setPasswordVisible((visible) => !visible)}
            register={register}
            toggleLabel={t(passwordVisible ? 'authentication.hidePassword' : 'authentication.showPassword')}
            visible={passwordVisible}
          />

          {isRegister && (
            <PasswordField
              autoComplete="new-password"
              errorMessage={errors.confirmPassword?.message ? t(errors.confirmPassword.message) : undefined}
              label={t('authentication.confirmPassword')}
              name="confirmPassword"
              onToggle={() => setConfirmPasswordVisible((visible) => !visible)}
              register={register}
              toggleLabel={t(
                confirmPasswordVisible ? 'authentication.hideConfirmPassword' : 'authentication.showConfirmPassword',
              )}
              visible={confirmPasswordVisible}
            />
          )}

          {requestError && (
            <p className={styles.requestError} role="alert">
              {requestError}
            </p>
          )}

          <Button className={styles.submit} disabled={pending} type="submit">
            {submitLabel}
            {!pending && <ArrowRight aria-hidden="true" size={18} />}
          </Button>
        </form>

        <p className={styles.switchMode}>
          {t(copyKeys.prompt)}{' '}
          <Link to={{ pathname: copyKeys.switchPath, search: location.search }}>{t(copyKeys.submit)}</Link>
        </p>
      </div>
    </section>
  )
}
