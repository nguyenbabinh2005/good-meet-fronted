import { useAppSelector } from '../../../app/store'
import { useCreateMeetingMutation } from '../../../entities/meeting/api/meeting.api'

export const useCreateMeeting = () => {
  const user = useAppSelector((state) => state.auth.user)
  const mutation = useCreateMeetingMutation()

  const create = async ({ displayName, title }: { displayName?: string; title: string }) => {
    if (!user) throw new Error('Sign in to create a meeting')
    return mutation.mutateAsync({
      displayName: displayName?.trim() || user.displayName,
      title: title.trim(),
      userId: user.userId,
    })
  }

  return { create, isPending: mutation.isPending }
}
