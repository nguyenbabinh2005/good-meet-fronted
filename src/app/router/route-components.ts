import { lazy } from 'react'

export const HomePage = lazy(() => import('../../pages/home/HomePage'))
export const JoinMeetingPage = lazy(() => import('../../pages/join-meeting/JoinMeetingPage'))
export const LoginPage = lazy(() => import('../../pages/login/LoginPage'))
export const MeetingDetailPage = lazy(() => import('../../pages/meeting-detail/MeetingDetailPage'))
export const MeetingRoomPage = lazy(() => import('../../pages/meeting-room/MeetingRoomPage'))
export const MyMeetingsPage = lazy(() => import('../../pages/my-meetings/MyMeetingsPage'))
export const NotFoundPage = lazy(() => import('../../pages/not-found/NotFoundPage'))
export const RegisterPage = lazy(() => import('../../pages/register/RegisterPage'))
export const ScheduleMeetingPage = lazy(() => import('../../pages/schedule-meeting/ScheduleMeetingPage'))
export const SettingsPage = lazy(() => import('../../pages/settings/SettingsPage'))
export const WaitingRoomPage = lazy(() => import('../../pages/waiting-room/WaitingRoomPage'))
