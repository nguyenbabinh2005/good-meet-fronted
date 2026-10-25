import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type AssistantState = { byCode: Record<string, boolean> }

const initialState: AssistantState = { byCode: {} }

const assistantSlice = createSlice({
  initialState,
  name: 'assistant',
  reducers: {
    assistantSet: (state, action: PayloadAction<{ code: string; enabled: boolean }>) => {
      state.byCode[action.payload.code] = action.payload.enabled
    },
  },
})

export const { assistantSet } = assistantSlice.actions
export default assistantSlice.reducer
