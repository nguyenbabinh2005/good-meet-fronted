import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assignParticipant,
  closeBreakoutRoom,
  createBreakoutRoom,
  listBreakoutRooms,
  returnParticipant,
} from './breakout.api'

const request = vi.fn()
vi.mock('../../../shared/api/http-client', () => ({
  httpClient: { request: (config: unknown) => request(config) },
  participantHeaders: (participantId: string) => ({ 'X-Participant-Id': participantId }),
}))

describe('breakout API', () => {
  beforeEach(() => {
    request.mockReset()
    request.mockResolvedValue({ data: undefined, status: 204 })
  })

  it('creates a room as the host', async () => {
    request.mockResolvedValue({ data: { id: 'b1', name: 'Nhóm 1' }, status: 201 })

    await expect(createBreakoutRoom({ code: 'gm-abcd-efgh', hostParticipantId: 'h1', name: 'Nhóm 1' })).resolves.toEqual({
      id: 'b1',
      name: 'Nhóm 1',
    })
    expect(request).toHaveBeenCalledWith({
      data: { name: 'Nhóm 1' },
      headers: { 'X-Participant-Id': 'h1' },
      method: 'POST',
      url: '/meetings/gm-abcd-efgh/breakout-rooms',
    })
  })

  it('lists the rooms with their participants as the host', async () => {
    await listBreakoutRooms({ code: 'gm-abcd-efgh', hostParticipantId: 'h1' })

    expect(request).toHaveBeenCalledWith({
      headers: { 'X-Participant-Id': 'h1' },
      url: '/meetings/gm-abcd-efgh/breakout-rooms',
    })
  })

  it('assigns a participant with a PUT on the member path', async () => {
    await assignParticipant({ code: 'gm-abcd-efgh', hostParticipantId: 'h1', participantId: 'p1', roomId: 'b1' })

    expect(request).toHaveBeenCalledWith({
      headers: { 'X-Participant-Id': 'h1' },
      method: 'PUT',
      url: '/meetings/gm-abcd-efgh/breakout-rooms/b1/participants/p1',
    })
  })

  it('returns a participant acting as the caller', async () => {
    await returnParticipant({ callerParticipantId: 'p1', code: 'gm-abcd-efgh', participantId: 'p1', roomId: 'b1' })

    expect(request).toHaveBeenCalledWith({
      headers: { 'X-Participant-Id': 'p1' },
      method: 'DELETE',
      url: '/meetings/gm-abcd-efgh/breakout-rooms/b1/participants/p1',
    })
  })

  it('closes a room as the host', async () => {
    await closeBreakoutRoom({ code: 'gm-abcd-efgh', hostParticipantId: 'h1', roomId: 'b1' })

    expect(request).toHaveBeenCalledWith({
      headers: { 'X-Participant-Id': 'h1' },
      method: 'POST',
      url: '/meetings/gm-abcd-efgh/breakout-rooms/b1/close',
    })
  })
})
