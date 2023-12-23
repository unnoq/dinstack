import { createDb } from '+db/lib/db'
import type { Env } from './env'
import {
  createAuthGithub,
  createAuthGoogle,
  createCreateAuthJwtFn,
  createValidateAuthJwtFn,
} from './lib/auth'
import { createSendEmailFn } from './lib/email'

export function createContext({
  env,
  ec,
  request,
}: {
  env: Env
  ec: ExecutionContext
  request?: Request
}) {
  const db = createDb({ logger: env.WORKER_ENV === 'production', databaseUrl: env.DATABASE_URL })
  const createAuthJwt = createCreateAuthJwtFn({ env })
  const validateAuthJwt = createValidateAuthJwtFn({ env })
  const authGoogle = createAuthGoogle({ env })
  const authGithub = createAuthGithub({ env })
  const sendEmail = createSendEmailFn({ env })

  return {
    env,
    ec,
    db,
    request,
    email: {
      send: sendEmail,
    },
    auth: {
      google: authGoogle,
      github: authGithub,
      createJwt: createAuthJwt,
      validateJwt: validateAuthJwt,
    },
  }
}

export type Context = ReturnType<typeof createContext>
