import { useAppDispatch, useAppSelector } from '../../../app/store'
import { useCreateMeetingMutation } from '../../../entities/meeting/api/meeting.api'
import { meetingSaved } from '../../../entities/meeting/model/my-meetings.slice'

/**
 * Creates an instant meeting (signed-in users only) and remembers it locally.
 * The caller then enters the room through the join flow: the creator is the host,
 * so the backend admits them without the waiting room.
 */
export const useCreateMeeting = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const mutation = useCreateMeetingMutation()

  const create = async ({ displayName, title }: { displayName?: string; title: string }) => {
    if (!user) throw new Error('Sign in to create a meeting')
    const meeting = await mutation.mutateAsync({
      displayName: displayName?.trim() || user.displayName,
      title: title.trim(),
      userId: user.userId,
    })
    dispatch(meetingSaved(meeting))
    return meeting
  }

  return { create, isPending: mutation.isPending }
}
