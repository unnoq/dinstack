import { Sessions } from '@api/database/schema'
import { authedProcedure } from '@api/trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const authOrganizationSwitchRoute = authedProcedure
  .input(
    z.object({
      organization: z.object({
        id: z.string().uuid(),
      }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.db.update(Sessions).set({ organizationId: input.organization.id }).where(eq(Sessions.id, ctx.session.id))
  })