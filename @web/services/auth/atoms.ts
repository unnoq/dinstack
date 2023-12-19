import { sessionSelectSchema } from '@api/database/schema'
import { atomWithLocalStorage } from '@web/lib/jotai'
import { z } from 'zod'

export const sessionSecretKeyAtom = atomWithLocalStorage(
  'services/auth/session-secret-key',
  sessionSelectSchema.shape['secretKey'].nullable(),
  null,
)

export const oauthStateAtom = atomWithLocalStorage(
  'services/auth/oauth-state',
  z
    .object({
      state: z.string(),
      codeVerifier: z.string(),
      authorizationRedirectUrl: z.string().url(),
    })
    .nullable(),
  null,
)

export const emailLoginHistoryAtom = atomWithLocalStorage(
  'services/auth/email-login-history',
  z.object({
    loginEmail: z.string().email().nullable(),
    loginEmailAt: z.date().nullable(),
  }),
  {
    loginEmail: null,
    loginEmailAt: null,
  },
)