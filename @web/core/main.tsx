import './global.css'
import { router } from './router'
import { ScrollArea } from '@web/components/ui/scroll-area'
import { Toaster } from '@web/components/ui/toaster'
import { AuthProvider } from '@web/providers/auth'
import { PostHogProvider } from '@web/providers/post-hog'
import { QueryProvider } from '@web/providers/query'
import { ThemeProvider } from '@web/providers/theme'
import { TurnstileProvider } from '@web/providers/turnstile'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider context={{}}>
      <ThemeProvider>
        <ScrollArea className="h-screen">
          <PostHogProvider>
            <TurnstileProvider>
              <QueryProvider enablePostHog enableTurnstile>
                <AuthProvider>
                  <div className="h-screen">
                    <RouterProvider router={router} />
                  </div>
                </AuthProvider>
              </QueryProvider>
            </TurnstileProvider>
          </PostHogProvider>
        </ScrollArea>
      </ThemeProvider>
    </HelmetProvider>

    <Toaster />
  </React.StrictMode>,
)
