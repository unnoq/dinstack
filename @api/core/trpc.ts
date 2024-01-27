import type { Context } from '@api/lib/context'
import type { Db } from '@api/lib/db'
import { TRPCError, experimental_standaloneMiddleware, initTRPC } from '@trpc/server'
import SuperJSON from 'superjson'

const t = initTRPC.context<Context & { request: Request }>().create({
  transformer: SuperJSON,
})

export const middleware = t.middleware
export const router = t.router

// TODO: use this extension when you not using @extension or turnstile support browser extension (not support for now 9-1-2024)
const _turnstileMiddleware = middleware(async ({ ctx, next, type }) => {
  if (type === 'mutation') {
    const formData = new FormData()
    formData.append('secret', ctx.env.TURNSTILE_SECRET_KEY)
    formData.append('response', ctx.request.headers.get('X-Turnstile-Token'))
    formData.append('remoteip', ctx.request.headers.get('CF-Connecting-IP'))

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    })
    const outcome = (await res.json()) as { success: boolean }
    if (!outcome.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You are behaving like an automated bot.',
      })
    }
  }

  return next({
    ctx,
  })
})

export const procedure = t.procedure.use(
  middleware(async ({ ctx, next, path, type }) => {
    const start = Date.now()
    const result = await next({ ctx })
    const executionTime = Date.now() - start

    if (type === 'query' && executionTime > 200) {
      ctx.ph.capture({
        distinctId: '__API__',
        event: 'trpc_slow_route',
        properties: {
          path,
          type,
          executionTime,
        },
      })
    }

    if (type === 'mutation' && executionTime > 400) {
      ctx.ph.capture({
        distinctId: '__API__',
        event: 'trpc_slow_route',
        properties: {
          path,
          type,
          executionTime,
        },
      })
    }

    return result
  }),
)

const authMiddleware = middleware(async ({ ctx, next }) => {
  const auth = {}

  throw new Error('Does not implement')

  if (!auth) throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({
    ctx: {
      ...ctx,
      auth,
    },
  })
})

export const authProcedure = procedure.use(authMiddleware)

export const organizationMemberMiddleware = experimental_standaloneMiddleware<{
  ctx: { auth: { userId: string }; db: Db }
  input: { organizationId: string } | { organization: { id: string } }
}>().create(async ({ ctx, next, input }) => {
  const organizationId = 'organizationId' in input ? input.organizationId : input.organization.id

  const organizationMember = await ctx.db.query.OrganizationMembers.findFirst({
    where(t, { and, eq }) {
      return and(eq(t.organizationId, organizationId), eq(t.userId, ctx.auth.userId))
    },
  })

  if (!organizationMember)
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this organization.',
    })

  return next()
})

export const organizationAdminMiddleware = experimental_standaloneMiddleware<{
  ctx: { auth: { userId: string }; db: Db }
  input: { organizationId: string } | { organization: { id: string } }
}>().create(async ({ ctx, next, input }) => {
  const organizationId = 'organizationId' in input ? input.organizationId : input.organization.id

  const organizationMember = await ctx.db.query.OrganizationMembers.findFirst({
    where(t, { and, eq }) {
      return and(
        eq(t.organizationId, organizationId),
        eq(t.userId, ctx.auth.userId),
        eq(t.role, 'admin'),
      )
    },
  })

  if (!organizationMember)
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not an admin of this organization.',
    })

  return next()
})
