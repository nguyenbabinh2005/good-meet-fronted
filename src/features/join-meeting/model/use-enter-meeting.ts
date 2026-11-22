import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { meetingKeys } from '../../../entities/meeting/api/meeting.api'
import { hostParticipantRemembered } from '../../../entities/meeting/model/host-participants.slice'
import { meetingSessionEstablished } from '../../../entities/meeting/model/meeting-session.slice'
import { joinMeeting } from '../api/join.api'
import { describeJoinError } from '../lib/join-error'
import { normalizeMeetingCode } from '../lib/meeting-code'
import { joinRequestCreated } from './join-request.slice'

/** Joins a meeting: straight into the room (host) or into the waiting room (everyone else). */
export const useEnterMeeting = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userId = useAppSelector((state) => state.auth.user?.userId)
  const mutation = useMutation({ mutationFn: joinMeeting })
  const [errorKey, setErrorKey] = useState<string>()

  const enter = async ({ code, displayName }: { code: string; displayName: string }) => {
    const publicCode = normalizeMeetingCode(code)
    setErrorKey(undefined)
    try {
      const outcome = await mutation.mutateAsync({ code: publicCode, displayName: displayName.trim(), userId })
      if (outcome.kind === 'joined') {
        dispatch(meetingSessionEstablished(outcome.join))
        if (outcome.join.role === 'HOST') {
          dispatch(
            hostParticipantRemembered({ code: outcome.join.publicCode, participantId: outcome.join.participantId }),
          )
        }
        await queryClient.invalidateQueries({ queryKey: meetingKeys.all })
        await navigate(`/meetings/${encodeURIComponent(outcome.join.publicCode)}`)
        return
      }
      dispatch(joinRequestCreated({ displayName: displayName.trim(), publicCode, requestId: outcome.requestId }))
      await navigate('/waiting')
    } catch (error) {
      setErrorKey(describeJoinError(error))
    }
  }

  return { enter, errorKey, isPending: mutation.isPending }
}
