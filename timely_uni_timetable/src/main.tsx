import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import routes from './router/routes.tsx'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { appStore } from './store/appStore.ts'
import AppProvider from './context/AppContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <Provider store={appStore}>
        <Toaster position="top-right" reverseOrder={false} />
        <RouterProvider router={routes} />
      </Provider>
    </AppProvider>
  </StrictMode>,
)