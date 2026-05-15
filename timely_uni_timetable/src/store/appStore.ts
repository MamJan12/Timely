import { configureStore } from '@reduxjs/toolkit'

export const appStore = configureStore({
  reducer: {
    // slices will be added here as you build more pages
  },
})

export type RootState = ReturnType<typeof appStore.getState>
export type AppDispatch = typeof appStore.dispatch