import '../init'
import { router } from './router'
import { Toaster } from '@web/components/ui/toaster'
import '@web/core/global.css'
import { AuthProvider } from '@web/providers/auth'
import { QueryProvider } from '@web/providers/query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* TODO: enable turnstile when it support chrome extension */}
    <QueryProvider disableTurnstile={true}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>

    <Toaster />
  </React.StrictMode>,
)
