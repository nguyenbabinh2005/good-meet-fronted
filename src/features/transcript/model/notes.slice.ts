import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type NotesState = { byCode: Record<string, boolean> }

const initialState: NotesState = { byCode: {} }

const notesSlice = createSlice({
  initialState,
  name: 'notes',
  reducers: {
    notesSet: (state, action: PayloadAction<{ code: string; enabled: boolean }>) => {
      state.byCode[action.payload.code] = action.payload.enabled
    },
  },
})

export const { notesSet } = notesSlice.actions
export default notesSlice.reducer
