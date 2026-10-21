import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store'

export const ProtectedRoute = () => {
  const location = useLocation()
  const authenticated = useAppSelector(
    (state) => state.auth.status === 'authenticated',
  )
  const destination = `${location.pathname}${location.search}${location.hash}`
  return authenticated ? (
    <Outlet />
  ) : (
    <Navigate
      replace
      to={`/login?redirectTo=${encodeURIComponent(destination)}`}
    />
  )
}

export const AnonymousOnlyRoute = () => {
  const location = useLocation()
  const authenticated = useAppSelector(
    (state) => state.auth.status === 'authenticated',
  )
  const redirectTo = new URLSearchParams(location.search).get('redirectTo')
  const requestedRoute =
    redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/'
  return authenticated ? <Navigate replace to={requestedRoute} /> : <Outlet />
}
