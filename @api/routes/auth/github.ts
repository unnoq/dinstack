import { OauthAccounts, Users } from '@api/database/schema'
import { procedure, router } from '@api/trpc'
import { TRPCError } from '@trpc/server'
import type { GitHubUser } from 'arctic'
import { generateState } from 'arctic'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const authGithubRouter = router({
  loginUrl: procedure.mutation(async ({ ctx }) => {
    const state = generateState()
    const url = await ctx.auth.github.createAuthorizationURL(state)

    return { url, state }
  }),
  validate: procedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tokens = await ctx.auth.github.validateAuthorizationCode(input.code)
      // TODO: use arctic
      // const userGithub = await ctx.auth.github.getUser(tokens.accessToken)

      const userGithub = (await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'user-agent': 'arctic',
        },
      }).then((res) => res.json())) as GitHubUser

      if (!userGithub.email)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Please make sure your Github account has an email' })

      const githubUserId = userGithub.id.toString()
      const githubEmail = userGithub.email.toLocaleLowerCase()
      const githubName = userGithub.name || userGithub.login
      const githubAvatarUrl = userGithub.avatar_url

      const oauthAccount = await ctx.db.query.OauthAccounts.findFirst({
        where(t, { eq, and }) {
          return and(eq(t.provider, 'github'), eq(t.providerUserId, githubUserId))
        },
      })

      if (oauthAccount) {
        ctx.ec.waitUntil(
          (async () => {
            await ctx.db
              .update(Users)
              .set({
                name: githubName,
                avatarUrl: githubAvatarUrl,
              })
              .where(eq(Users.id, githubUserId))
          })(),
        )

        return {
          auth: {
            user: {
              id: githubUserId,
              name: githubName,
              email: githubEmail,
              avatarUrl: githubAvatarUrl,
            },
            jwt: await ctx.auth.createJwt({ user: { id: githubUserId } }),
          },
        }
      }

      const userByEmail = await ctx.db.query.Users.findFirst({
        where(t, { eq }) {
          return eq(t.email, githubEmail)
        },
      })

      if (userByEmail) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Please login with your email and link to your Github account first',
        })
      }

      const user = await ctx.db.transaction(async (trx) => {
        const [user] = await trx
          .insert(Users)
          .values({
            email: githubEmail,
            name: githubName,
            avatarUrl: githubAvatarUrl,
          })
          .returning()

        if (!user) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' })
        }

        await trx.insert(OauthAccounts).values({
          provider: 'github',
          providerUserId: githubUserId,
          userId: user.id,
        })

        return user
      })

      return {
        auth: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          jwt: await ctx.auth.createJwt({ user: { id: user.id } }),
        },
      }
    }),
})