import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

const platformsAdapter = createEntityAdapter({
  selectId: (platform) => platform.id,
})

export const platformCatalog = [
  { id: 'all', name: 'All platforms', color: '#6b5edb' },
  { id: 'general', name: 'General', color: '#718097' },
  { id: 'linkedin', name: 'LinkedIn', color: '#2f7fc1' },
  { id: 'x', name: 'X', color: '#17233d' },
  { id: 'instagram', name: 'Instagram', color: '#d86a87' },
]

const initialState = platformsAdapter.addMany(
  platformsAdapter.getInitialState({ selectedId: 'all' }),
  platformCatalog,
)

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    platformSelected: (state, action) => {
      state.selectedId = action.payload
    },
  },
})

export const { platformSelected } = platformsSlice.actions
export const platformsSelectors = platformsAdapter.getSelectors((state) => state.platforms)
export default platformsSlice.reducer
