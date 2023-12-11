import { authedProcedure } from '@api/trpc'
import { TRPCError } from '@trpc/server'

export const authInfosRoute = authedProcedure.query(async ({ ctx }) => {
  const session = await ctx.db.query.Sessions.findFirst({
    where(t, { eq }) {
      return eq(t.id, ctx.session.id)
    },
    with: {
      organizationMember: {
        with: {
          organization: {
            with: {
              members: true,
            },
          },
          user: true,
        },
      },
    },
  })

  if (!session) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to find session',
    })
  }

  return {
    session,
  }
})