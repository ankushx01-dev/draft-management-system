import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

const postsAdapter = createEntityAdapter({
  selectId: (post) => post.id,
  sortComparer: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
})

const initialState = postsAdapter.getInitialState({
  status: 'idle',
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postsHydrated: (state, action) => {
      postsAdapter.setAll(state, action.payload)
      state.status = 'succeeded'
    },
    postAdded: postsAdapter.addOne,
    postUpdated: postsAdapter.updateOne,
    postRemoved: postsAdapter.removeOne,
  },
})

export const { postsHydrated, postAdded, postUpdated, postRemoved } = postsSlice.actions
export const postsSelectors = postsAdapter.getSelectors((state) => state.posts)
export default postsSlice.reducer
