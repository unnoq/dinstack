import { TRPCClientError } from '@trpc/client'
import { useEffectOnce } from '@web/hooks/use-effect-once'
import { api } from '@web/lib/api'
import { useAuthStore } from '@web/stores/auth'

export function AuthProvider(props: { children: React.ReactNode }) {
  const utils = api.useUtils()

  useEffectOnce(() => {
    ;(async () => {
      if (!useAuthStore.getState().session) return

      try {
        const data = await utils.auth.infos.fetch()
        useAuthStore.setState({ session: data.session })
      } catch (err) {
        if (err instanceof TRPCClientError) {
          const code = err.data?.code

          if (code === 'UNAUTHORIZED') {
            useAuthStore.setState({ session: null })
          }
        }
      }
    })()
  })

  return props.children
}
