import { parseJWT } from 'oslo/jwt'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  name: string
  avatarUrl: string
  email: string
}

type OrganizationMember = {
  role: 'admin' | 'member'
  organization: {
    id: string
    name: string
    logoUrl: string
  }
}

type Authed = {
  user: User
  organizationMember: OrganizationMember
  jwt: string
}

type Unauthed = {
  user: null
  jwt: null
  organizationMember: null
}

type State = {
  state: string | null
  codeVerifier: string | null
  setState: (state: string | null) => void
  setCodeVerifier: (codeVerifier: string | null) => void
}

export const useAuthStore = create(
  persist<
    (Authed | Unauthed) &
      State & {
        setAuth: (authed: { user: User; organizationMember: OrganizationMember; jwt: string }) => void
        reset: () => void
      }
  >(
    (set) => ({
      user: null,
      organizationMember: null,
      jwt: null,
      state: null,
      codeVerifier: null,
      setAuth(auth) {
        set(() => auth)
      },
      setState(state) {
        set(() => ({ state }))
      },
      setCodeVerifier(codeVerifier) {
        set(() => ({ codeVerifier }))
      },
      reset() {
        set(() => ({ user: null, jwt: null, state: null, codeVerifier: null }))
      },
    }),
    {
      name: 'auth-store',
      skipHydration: true,
      version: 0,
      onRehydrateStorage: () => {
        return (state) => {
          if (!state || !state.jwt) return

          try {
            const jwt = parseJWT(state.jwt)

            if (!jwt?.expiresAt || jwt.expiresAt.getTime() < Date.now() - 60 * 60 * 1000) {
              state.reset()
            }
          } catch {
            state.reset()
          }
        }
      },
    },
  ),
)

export function useUnauthedStore() {
  const auth = useAuthStore()
  if (auth.user) {
    throw new Error('Require session to be unauthenticated')
  }

  return auth
}

export function useAuthedStore() {
  const auth = useAuthStore()
  if (!auth.user) {
    throw new Error('Require session to be authenticated')
  }

  return auth
}
