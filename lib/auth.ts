import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";

import db from "./db";
import { accounts, sessions, users, verificationTokens } from "./schema";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          gh_username: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: VERCEL_DEPLOYMENT
          ? `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          : undefined,
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        // @ts-expect-error
        id: token.sub,
        // @ts-expect-error
        username: token?.user?.username || token?.user?.gh_username,
      };
      return session;
    },
    redirect: async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
      // If the user is already on the app, maintain the URL
      if (url.startsWith(baseUrl)) {
        // Default is to return to homepage after login
        if (url.includes("/login")) {
          return `${baseUrl}/app`; // Or whatever default post-login path
        }
        return url;
      }
      // Otherwise, redirect to dashboard
      return `${baseUrl}/app`;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions) as Promise<{
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      image: string;
    };
  } | null>;
}

export function withMovieAuth(action: any) {
  return async (
    formData: FormData | null,
    movieId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const movie = await db.query.Movies.findFirst({
      where: (Movies, { eq }) => eq(Movies.id, movieId),
    });

    if (!movie || movie.userId !== session.user.id) {
      return {
        error: "movie not found",
      };
    }

    return action(formData, movie, key);
  };
}
export function withActorAuth(action: any) {
  return async (
    formData: FormData | null,
    actorId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const actor = await db.query.actor.findFirst({
      where: (actor, { eq }) => eq(actor.id, actorId),
    });

    if (!actor) {
      return {
        error: "actor not found",
      };
    }

    return action(formData, actor, key);
  };
}
export function withDirectorAuth(action: any) {
  return async (
    formData: FormData | null,
    directorId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const director = await db.query.director.findFirst({
      where: (director, { eq }) => eq(director.id, directorId),
    });

    if (!director) {
      return {
        error: "director not found",
      };
    }

    return action(formData, director, key);
  };
}
