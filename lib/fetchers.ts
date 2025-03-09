import { unstable_cache } from "next/cache";
import db from "./db";
import { and, desc, eq } from "drizzle-orm";
import { Movies, users } from "./schema";
import { serialize } from "next-mdx-remote/serialize";


export async function getHomePageMovies() {
  return await unstable_cache(
    async () => {
      return await db
        .select({
          title: Movies.title,
          description: Movies.description,
          slug: Movies.slug,
          image: Movies.image,
          createdAt: Movies.createdAt,
          user: users,
        })
        .from(Movies)
        .leftJoin(users, eq(Movies.userId, users.id))
        .where(
          and(
            eq(Movies.published, true),
          ),
        )
        .orderBy(desc(Movies.createdAt));
    },
    [`movies-for-site`],
    {
      revalidate: 900,
      tags: [`movies-for-site`],
    },
  )();
}

export async function getMovieData(slug: string) {
  return await unstable_cache(
    async () => {
      const data = await db
        .select({
          post: Movies,
          user: users,
        })
        .from(Movies)
        .leftJoin(users,  eq(Movies.userId, users.id))
        .where(
          and(
            eq(Movies.slug, slug),
          ),
        )
        .then((res) =>
          res.length > 0
            ? {
                ...res[0].post
                  ? {
                      user: res[0].user,
                      ...res[0].post,
                    }
                  : null,
              }
            : null,
        );

      if (!data) return null;

      const [mdxSource, adjacentPosts] = await Promise.all([
        getMdxSource(data.content!),
        db
          .select({
            slug: Movies.slug,
            title: Movies.title,
            createdAt: Movies.createdAt,
            description: Movies.description,
            image: Movies.image,
          })
          .from(Movies)
          .where(
            and(
              eq(Movies.published, true),
            ),
          ),
      ]);

      return {
        ...data,
        mdxSource,
        adjacentPosts,
      };
    },
    [`post-${slug}`],
    {
      revalidate: 900, // 15 minutes
      tags: [`post-${slug}`],
    },
  )();
}

async function getMdxSource(postContents: string) {
  // transforms links like <link> to [link](link) as MDX doesn't support <link> syntax
  // https://mdxjs.com/docs/what-is-mdx/#markdown
  const content =
    postContents?.replaceAll(/<(https?:\/\/\S+)>/g, "[$1]($1)") ?? "";
  // Serialize the content string into MDX
  const mdxSource = await serialize(content, {

  });

  return mdxSource;
}
