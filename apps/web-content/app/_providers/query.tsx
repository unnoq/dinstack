'use client'

import { api } from '@shared-react/lib/api'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TRPCClientError, httpBatchLink } from '@trpc/client'
import { getTurnstileToken } from '@turnstile-react/lib/turnstile'
import { useToast } from '@ui/ui/use-toast'
import { sessionAtom } from '@web-content/atoms/auth'
import { env } from '@web-content/lib/env'
import { jotaiStore } from '@web-content/lib/jotai'
import { RESET } from 'jotai/utils'
import { useState } from 'react'
import SuperJSON from 'superjson'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError(err) {
            if (err instanceof TRPCClientError && err.data?.code === 'UNAUTHORIZED') {
              jotaiStore.set(sessionAtom, RESET)
            }
          },
        }),
        mutationCache: new MutationCache({
          onError(err) {
            if (err instanceof TRPCClientError) {
              const code = err.data?.code
              const message = err.message

              if (code === 'UNAUTHORIZED') {
                jotaiStore.set(sessionAtom, RESET)
              }

              if (message !== code && code !== 'INTERNAL_SERVER_ERROR') {
                toast({
                  variant: 'destructive',
                  title: message,
                })
              } else {
                toast({
                  variant: 'destructive',
                  title: 'Something went wrong, please try again later',
                })
              }
            }
          },
        }),
      }),
  )

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: SuperJSON,
      links: [
        httpBatchLink({
          url: new URL('/trpc', env.NEXT_PUBLIC_API_URL).toString(),
          async headers() {
            const session = jotaiStore.get(sessionAtom)
            const headers: Record<string, string> = {}

            if (session) {
              headers['Authorization'] = `Bearer ${session.secretKey}`
            }

            return headers
          },
          async fetch(input, init) {
            const method = init?.method?.toUpperCase() ?? 'GET'
            if (method === 'POST' && init) {
              const token = await getTurnstileToken()

              init.headers = {
                ...init.headers,
                'X-Turnstile-Token': `${token}`,
              }
            }

            return await fetch(input, init)
          },
        }),
      ],
    }),
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  )
}
