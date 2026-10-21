import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../../widgets/app-header/AppLayout'
import {
  HomePage,
  JoinMeetingPage,
  LoginPage,
  MeetingDetailPage,
  MeetingRoomPage,
  MyMeetingsPage,
  NotFoundPage,
  RegisterPage,
  ScheduleMeetingPage,
  SettingsPage,
  WaitingRoomPage,
} from './route-components'
import { AnonymousOnlyRoute, ProtectedRoute } from './route-guards'

const developmentRoutes = import.meta.env.DEV
  ? [
      {
        path: 'dev/participant-themes',
        lazy: async () => ({
          Component: (
            await import(
              '../../pages/participant-theme-demo/ParticipantThemeDemoPage'
            )
          ).default,
        }),
      },
    ]
  : []

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'join', element: <JoinMeetingPage /> },
      { path: 'waiting', element: <WaitingRoomPage /> },
      { path: 'meetings/:meetingId', element: <MeetingRoomPage /> },
      ...developmentRoutes,
      {
        element: <AnonymousOnlyRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'meetings', element: <MyMeetingsPage /> },
          { path: 'meetings/schedule', element: <ScheduleMeetingPage /> },
          {
            path: 'meeting-details/:meetingId',
            element: <MeetingDetailPage />,
          },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
