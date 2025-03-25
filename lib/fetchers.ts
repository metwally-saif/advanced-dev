import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { serialize } from "next-mdx-remote/serialize";

import { getSession } from "./auth";
import db from "./db";
import {
  actor,
  director,
  movieActors,
  movieDirectors,
  Movies,
  ratings,
  reviews,
  SelectActor,
  users,
} from "./schema";

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
        .where(and(eq(Movies.published, true)))
        .orderBy(desc(Movies.createdAt));
    },
    [`movies-for-site`],
    {
      revalidate: 900,
      tags: [`movies-for-site`,
        `movies-list`,
        `movies-all`
      ],
    },
  )();
}

export async function getHomePageActors() {
  return await unstable_cache(
    async () => {
      return await db
        .select({
          id: actor.id,
          name: actor.name,
          image: actor.image,
          age: actor.age,
        })
        .from(actor);
    },
    [`actors-for-site`],
    {
      revalidate: 900,
      tags: [`actors-for-site`,
        `actors-list`,
        `actors-all`,
      ],
    },
  )();
}

export async function getHomePageDirectors() {
  return await unstable_cache(
    async () => {
      return await db
        .select({
          id: director.id,
          name: director.name,
          image: director.image,
          age: director.age,
        })
        .from(director);
    },
    [`directors-for-site`],
    {
      revalidate: 900,
      tags: [`directors-for-site`,
        `directors-list`,
        `directors-all`,
      ],
    },
  )();
}

export async function getMoviesByRating(
  page: number = 1,
  limit: number = 10,
  genre?: string,
  userId?: string,
) {
  return await unstable_cache(
    async () => {
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build the base query with conditional where clauses
      const whereConditions = [eq(Movies.published, true)];

      // Add genre filter if specified
      if (genre) {
        whereConditions.push(eq(Movies.genre, genre as any));
      }
      const query = db
        .select({
          id: Movies.id,
          title: Movies.title,
          description: Movies.description,
          genre: Movies.genre,
          slug: Movies.slug,
          image: Movies.image,
          createdAt: Movies.createdAt,
          // Aggregate average rating from ratings table
          averageRating: sql<number>`avg(${ratings.rating})`.as(
            "averageRating",
          ),
          // Count total ratings
          ratingCount: sql<number>`count(${ratings.id})`.as("ratingCount"),
          // User data for display
          user: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(Movies)
        .leftJoin(ratings, eq(ratings.movieId, Movies.id))
        .leftJoin(users, eq(Movies.userId, users.id))
        .where(and(...whereConditions));

      // Get the movies with aggregated data, grouped by movie
      const moviesQuery = query
        .groupBy(
          Movies.id,
          Movies.title,
          Movies.description,
          Movies.slug,
          Movies.image,
          Movies.createdAt,
          Movies.genre,
          users.id,
          users.name,
          users.image,
        )
        .orderBy(desc(sql`avg(${ratings.rating})`))
        .limit(limit)
        .offset(offset);

      // Execute the query
      const movies = await moviesQuery;

      const countWhereConditions = [eq(Movies.published, true)];
      if (genre) {
        countWhereConditions.push(eq(Movies.genre, genre as any));
      }

      // Get total count for pagination
      const totalCountResult = await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(Movies)
        .where(eq(Movies.published, true))
        .then((res) => Number(res[0].count) || 0);

      // If userId is provided, get the user's ratings for these movies
      let userRatings: Record<string, number> = {};

      if (userId) {
        const movieIds = movies.map((movie) => movie.id);

        if (movieIds.length > 0) {
          const userRatingsResult = await db
            .select({
              movieId: ratings.movieId,
              rating: ratings.rating,
            })
            .from(ratings)
            .where(
              and(
                eq(ratings.userId, userId),
                inArray(ratings.movieId, movieIds),
              ),
            );

          // Convert to lookup object for easy access
          userRatings = userRatingsResult.reduce(
            (acc, { movieId, rating }) => {
              acc[movieId] = rating;
              return acc;
            },
            {} as Record<string, number>,
          );
        }
      }

      const moviesWithUserRatings = movies.map((movie) => ({
        ...movie,
        userRating: userRatings[movie.id] || null,
        // Format average rating to one decimal place if tofixed is available
        averageRating: movie.averageRating
          ? parseFloat(Number(movie.averageRating).toFixed(1))
          : null,
      }));

      // Return movies with pagination metadata
      return {
        movies: moviesWithUserRatings,
        pagination: {
          page,
          limit,
          totalItems: totalCountResult,
          totalPages: Math.ceil(totalCountResult / limit),
        },
      };
    },
    [`movies-by-rating-${page}-${limit}-${genre}-${userId}`],
    {
      revalidate: 900, // 15 minutes
      tags: [`movies-list`, `ratings-list`, `movies-all`],
    },
  )();
}
export async function getMovieData(slug: string, session?: any) {
  return await unstable_cache(
    async () => {
      const userId = session?.user?.id;

      // Get movie data with user info
      const data = await db
        .select({
          post: Movies,
          user: users,
        })
        .from(Movies)
        .leftJoin(users, eq(Movies.userId, users.id))
        .where(and(eq(Movies.slug, slug)))
        .then((res) =>
          res.length > 0
            ? {
                ...(res[0].post
                  ? {
                      user: res[0].user,
                      ...res[0].post,
                    }
                  : null),
              }
            : null,
        );

      if (!data) {
        return null;
      }

      // Get rating stats for this movie
      const ratingStats = await db
        .select({
          averageRating: sql<number>`avg(${ratings.rating})`.as(
            "averageRating",
          ),
          ratingCount: sql<number>`count(${ratings.id})`.as("ratingCount"),
        })
        .from(ratings)
        .where(eq(ratings.movieId, data.id!))
        .then((res) => {
          const avgRating = res[0].averageRating;
          return {
            averageRating:
              avgRating !== null && avgRating !== undefined
                ? parseFloat(Number(avgRating).toFixed(1))
                : null,
            ratingCount: Number(res[0].ratingCount) || 0,
          };
        });

      // Get user's rating for this movie if logged in
      let userRating = null;
      if (userId) {
        userRating = await db
          .select({
            id: ratings.id,
            rating: ratings.rating,
            createdAt: ratings.createdAt,
          })
          .from(ratings)
          .where(and(eq(ratings.movieId, data.id!), eq(ratings.userId, userId)))
          .then((res) => res[0] || null);
      }

      // Get reviews for this movie with user info (paginated)
      const movieReviews = await db
        .select({
          id: reviews.id,
          content: reviews.content,
          rating: reviews.rating,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
          user: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
          // Flag if the review is by the current user
          isAuthor: sql<boolean>`${reviews.userId} = ${userId || ""}`.as(
            "isAuthor",
          ),
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.movieId, data.id!))
        .orderBy(desc(reviews.createdAt))
        .limit(10); // Limit to 10 most recent reviews

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
          .where(and(eq(Movies.published, true))),
      ]);

      return {
        ...data,
        mdxSource,
        adjacentPosts,
        ratings: {
          average: ratingStats.averageRating,
          count: ratingStats.ratingCount,
          userRating: userRating?.rating || null,
          userRatingId: userRating?.id || null,
        },
        reviews: movieReviews,
      };
    },
    [`post-${slug}`],
    {
      revalidate: 900, // 15 minutes
      tags: [
        `post-${slug}`,
        `ratings-${slug}`,
        `reviews-${slug}`,
        `movies-list`,      // Add list tag
        `movies-all`        // Add all tag
      ],    },
  )();
}

export async function getActorDataByName(name: string) {
  return await unstable_cache(
    async () => {
      const data = await db
        .select({
          actor: actor,
        })
        .from(actor)
        .where(and(eq(actor.name, name)))
        .leftJoin(movieActors, eq(actor.id, movieActors.actorId))
        .then((res) =>
          res.length > 0
            ? {
                ...(res[0].actor
                  ? {
                      ...res[0].actor,
                    }
                  : null),
              }
            : null,
        );

      if (!data) {
        return null;
      }

      return {
        ...data,
      };
    },
    [`actor-${name}`],
    {
      revalidate: 900, // 15 minutes
      tags: [
        `actor-${name}`,
        'actors-list',
        'actors-all'
      ],
    },
  )();
}

export async function getDirectorDataByName(name: string) {
  return await unstable_cache(
    async () => {
      const data = await db
        .select({
          director: director,
        })
        .from(director)

        .where(and(eq(director.name, name)))
        .leftJoin(movieDirectors, eq(movieDirectors.directorId, director.id))
        .then((res) =>
          res.length > 0
            ? {
                ...(res[0].director
                  ? {
                      ...res[0].director,
                    }
                  : null),
              }
            : null,
        );

      if (!data) {
        return null;
      }

      return {
        ...data,
      };
    },
    [`director-${name}`],
    {
      revalidate: 900, // 15 minutes
      tags: [`director-${name}`,
        'directors-list',
        'directors-all',
      ],
    },
  )();
}

// Get actors for a movie
export async function getMovieActors(
  movieId: string,
): Promise<SelectActor[] | { error: string }> {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  try {
    const movie = await db.query.Movies.findFirst({
      where: eq(Movies.id, movieId),
      with: {
        movieActors: {
          with: {
            actor: true,
          },
        },
      },
    });

    if (!movie) {
      return { error: "Movie not found" };
    }

    return movie.movieActors.map((ma) => ma.actor);
  } catch (error: any) {
    return { error: error.message };
  }
}

// Get directors for a movie
export async function getMovieDirectors(movieId: string) {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  try {
    const movie = await db.query.Movies.findFirst({
      where: eq(Movies.id, movieId),
      with: {
        movieDirectors: {
          with: {
            director: true,
          },
        },
      },
    });

    if (!movie) {
      return { error: "Movie not found" };
    }

    return movie.movieDirectors.map((md) => md.director);
  } catch (error: any) {
    return { error: error.message };
  }
}

async function getMdxSource(postContents: string) {
  // transforms links like <link> to [link](link) as MDX doesn't support <link> syntax
  // https://mdxjs.com/docs/what-is-mdx/#markdown
  const content =
    postContents?.replaceAll(/<(https?:\/\/\S+)>/g, "[$1]($1)") ?? "";
  // Serialize the content string into MDX
  const mdxSource = await serialize(content);

  return mdxSource;
}
