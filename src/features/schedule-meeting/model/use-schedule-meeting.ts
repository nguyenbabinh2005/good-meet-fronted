import { useAppDispatch, useAppSelector } from '../../../app/store'
import {
  useCancelMeetingMutation,
  useRescheduleMeetingMutation,
  useScheduleMeetingMutation,
} from '../../../entities/meeting/api/meeting.api'
import { meetingSaved } from '../../../entities/meeting/model/my-meetings.slice'
import { localInputToIso } from '../../../shared/lib/date-time'

export const useScheduleMeeting = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const mutation = useScheduleMeetingMutation()

  const schedule = async (values: { endAt: string; startAt: string; title: string }) => {
    if (!user) throw new Error('Sign in to schedule a meeting')
    const meeting = await mutation.mutateAsync({
      displayName: user.displayName,
      scheduledEndAt: localInputToIso(values.endAt),
      scheduledStartAt: localInputToIso(values.startAt),
      title: values.title.trim(),
      userId: user.userId,
    })
    dispatch(meetingSaved(meeting))
    return meeting
  }

  return { isPending: mutation.isPending, schedule }
}

export const useManageSchedule = (code: string) => {
  const dispatch = useAppDispatch()
  const userId = useAppSelector((state) => state.auth.user?.userId)
  const rescheduleMutation = useRescheduleMeetingMutation()
  const cancelMutation = useCancelMeetingMutation()

  const reschedule = async (values: { endAt: string; startAt: string }) => {
    if (!userId) throw new Error('Sign in to change the schedule')
    const meeting = await rescheduleMutation.mutateAsync({
      code,
      scheduledEndAt: localInputToIso(values.endAt),
      scheduledStartAt: localInputToIso(values.startAt),
      userId,
    })
    dispatch(meetingSaved(meeting))
  }

  const cancel = async () => {
    if (!userId) throw new Error('Sign in to cancel the meeting')
    dispatch(meetingSaved(await cancelMutation.mutateAsync({ code, userId })))
  }

  return {
    cancel,
    isCancelling: cancelMutation.isPending,
    isRescheduling: rescheduleMutation.isPending,
    reschedule,
  }
}
