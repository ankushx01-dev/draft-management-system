import { configureStore } from '@reduxjs/toolkit'
import postsReducer from './postsSlice'
import platformsReducer from './platformsSlice'

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
  },
})
