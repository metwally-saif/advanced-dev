/* eslint-disable max-lines */

"use server";

import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { revalidatePath, revalidateTag } from "next/cache";

import { getSession } from "@/lib/auth";

import { withActorAuth, withDirectorAuth, withMovieAuth } from "./auth";
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
  SelectDirector,
  SelectMovie,
  users,
} from "./schema";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

const revalidateContent = (
  type: "movie" | "actor" | "director",
  id?: string,
) => {
  // Always revalidate homepage
  revalidatePath("/", "page");

  // Revalidate the list pages
  revalidateTag("movies-list");
  revalidateTag("actors-list");
  revalidateTag("directors-list");

  // Revalidate specific content type
  revalidateTag(`${type}s-all`);

  // If we have an ID, revalidate specific content
  if (id) {
    revalidateTag(`${type}-${id}`);

    // For movies, also revalidate their relationships
    if (type === "movie") {
      revalidateTag(`movie-${id}-actors`);
      revalidateTag(`movie-${id}-directors`);
    }
  }
};

export async function addOrUpdateRating(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const movieId = formData.get("movieId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const ratingId = formData.get("ratingId") as string | null;

  if (!movieId) {
    return { error: "Movie ID is required" };
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5" };
  }

  try {
    // Check if movie exists
    const movie = await db.query.Movies.findFirst({
      where: eq(Movies.id, movieId),
    });

    if (!movie) {
      return { error: "Movie not found" };
    }

    let result;

    // If we have a ratingId, update existing rating
    if (ratingId) {
      // Verify ownership
      const existingRating = await db.query.ratings.findFirst({
        where: and(
          eq(ratings.id, ratingId),
          eq(ratings.userId, session.user.id),
        ),
      });

      if (!existingRating) {
        return {
          error: "Rating not found or you don't have permission to update it",
        };
      }

      // Update the rating
      [result] = await db
        .update(ratings)
        .set({
          rating,
          updatedAt: new Date(),
        })
        .where(eq(ratings.id, ratingId))
        .returning();
    } else {
      // Check if user already rated this movie
      const existingRating = await db.query.ratings.findFirst({
        where: and(
          eq(ratings.movieId, movieId),
          eq(ratings.userId, session.user.id),
        ),
      });

      if (existingRating) {
        // Update existing rating
        [result] = await db
          .update(ratings)
          .set({
            rating,
            updatedAt: new Date(),
          })
          .where(eq(ratings.id, existingRating.id))
          .returning();
      } else {
        // Create new rating
        [result] = await db
          .insert(ratings)
          .values({
            movieId,
            userId: session.user.id,
            rating,
          })
          .returning();
      }
    }

    // Revalidate cache for this movie
    revalidateTag(`post-${movie.slug}`);
    revalidateTag(`ratings-${movie.slug}`);
    revalidateTag(`movies-list`);
    revalidateTag(`ratings-list`);

    return { success: true, rating: result };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Add review to a movie
export async function addReview(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const movieId = formData.get("movieId") as string;
  const content = formData.get("content") as string;
  const slug = formData.get("slug") as string;

  if (!movieId) {
    return { error: "Movie ID is required" };
  }

  if (!content || content.trim().length < 10) {
    return { error: "Review content must be at least 10 characters" };
  }

  try {
    // Check if user already reviewed this movie
    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.movieId, movieId),
        eq(reviews.userId, session.user.id),
      ),
    });

    if (existingReview) {
      return { error: "You have already reviewed this movie" };
    }

    // Create review
    const [review] = await db
      .insert(reviews)
      .values({
        movieId,
        userId: session.user.id,
        content,
      })
      .returning();

    // Revalidate cache for this movie
    revalidateTag(`post-${slug}`);
    revalidateTag(`reviews-${slug}`);

    return { success: true, review };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Update review
export async function updateReview(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const reviewId = formData.get("reviewId") as string;
  const content = formData.get("content") as string;
  const slug = formData.get("slug") as string;

  if (!reviewId) {
    return { error: "Review ID is required" };
  }

  if (!content || content.trim().length < 10) {
    return { error: "Review content must be at least 10 characters" };
  }

  try {
    // Verify ownership
    const existingReview = await db.query.reviews.findFirst({
      where: and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)),
    });

    if (!existingReview) {
      return {
        error: "Review not found or you don't have permission to update it",
      };
    }

    // Update review
    const [review] = await db
      .update(reviews)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    // Revalidate cache for this movie
    revalidateTag(`post-${slug}`);
    revalidateTag(`reviews-${slug}`);

    return { success: true, review };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Delete review
export async function deleteReview(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const reviewId = formData.get("reviewId") as string;
  const slug = formData.get("slug") as string;

  if (!reviewId) {
    return { error: "Review ID is required" };
  }

  try {
    // Verify ownership
    const existingReview = await db.query.reviews.findFirst({
      where: and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)),
    });

    if (!existingReview) {
      return {
        error: "Review not found or you don't have permission to delete it",
      };
    }

    // Delete review
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    // Revalidate cache for this movie
    revalidateTag(`post-${slug}`);
    revalidateTag(`reviews-${slug}`);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export const createMovie = async (
  _: FormData,
): Promise<SelectMovie | { error: string }> => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const [response] = await db
    .insert(Movies)
    .values({
      userId: session.user.id,
    })
    .returning();

  // Comprehensive revalidation
  revalidateContent("movie", response.id);

  return response;
};

export const createActor = async (
  _: FormData,
): Promise<SelectActor | { error: string }> => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const [response] = await db
    .insert(actor)
    .values({
      id: nanoid(),
    })
    .returning();

  // Comprehensive revalidation
  revalidateContent("actor", response.id);

  return response;
};

export const createDirector = async (
  _: FormData,
): Promise<SelectDirector | { error: string }> => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const [response] = await db
    .insert(director)
    .values({
      id: nanoid(),
    })
    .returning();

  // Comprehensive revalidation
  revalidateContent("director", response.id);

  return response;
};

// creating a separate function for this because we're not using FormData
export const updateMovie = async (data: SelectMovie) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const post = await db.query.Movies.findFirst({
    where: eq(Movies.id, data.id),
  });

  if (!post || post.userId !== session.user.id) {
    return {
      error: "Post not found",
    };
  }

  try {
    const [response] = await db
      .update(Movies)
      .set({
        title: data.title,
        description: data.description,
        content: data.content,
      })
      .where(eq(Movies.id, data.id))
      .returning();

    // Comprehensive revalidation
    revalidateContent("movie", data.id);

    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updateMovieMetadata = withMovieAuth(
  async (formData: FormData, movie: SelectMovie, key: string) => {
    const value = formData.get(key) as string;

    try {
      const response = await db
        .update(Movies)
        .set({
          [key]: key === "published" ? value === "true" : value,
        })
        .where(eq(Movies.id, movie.id))
        .returning()
        .then((res) => res[0]);

      // Comprehensive revalidation
      revalidateContent("movie", movie.id);

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This slug is already in use`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const updateActorMetadata = withActorAuth(
  async (formData: FormData, selectedActor: SelectActor, key: string) => {
    let value = formData.get(key) as string;

    try {
      if (key === "birthdate" || key.includes("date")) {
        if (!value) {
          value = null as any;
        } else if (
          typeof value === "string" &&
          value.match(/^\d{4}-\d{2}-\d{2}/)
        ) {
          value = new Date(value) as any;
        }
      }
      const response = await db
        .update(actor)
        .set({
          [key]: value,
        })
        .where(eq(actor.id, selectedActor.id))
        .returning()
        .then((res) => res[0]);

      // Comprehensive revalidation
      revalidateContent("actor", selectedActor.id);

      // Also revalidate any movies this actor might be in
      revalidateTag(`actor-${selectedActor.id}-movies`);

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const updateDirectorMetadata = withDirectorAuth(
  async (formData: FormData, selectedDirector: SelectDirector, key: string) => {
    const value = formData.get(key) as string;

    try {
      const response = await db
        .update(director)
        .set({
          [key]: value,
        })
        .where(eq(director.id, selectedDirector.id))
        .returning()
        .then((res) => res[0]);

      // Comprehensive revalidation
      revalidateContent("director", selectedDirector.id);

      // Also revalidate any movies this director might be in
      revalidateTag(`director-${selectedDirector.id}-movies`);

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const deleteMovie = withMovieAuth(
  async (_: FormData, post: SelectMovie) => {
    try {
      const [response] = await db
        .delete(Movies)
        .where(eq(Movies.id, post.id))
        .returning({
          slug: Movies.slug,
        });

      // Comprehensive revalidation
      revalidateContent("movie", post.id);

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const deleteActor = withActorAuth(
  async (_: FormData, selectedActor: SelectActor) => {
    try {
      const [response] = await db
        .delete(actor)
        .where(eq(actor.id, selectedActor.id))
        .returning({
          id: actor.id,
        });

      // Comprehensive revalidation
      revalidateContent("actor", selectedActor.id);

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const deleteDirector = withDirectorAuth(
  async (_: FormData, selectedDirector: SelectDirector) => {
    try {
      const [response] = await db
        .delete(director)
        .where(eq(director.id, selectedDirector.id))
        .returning({
          id: director.id,
        });

      // Comprehensive revalidation
      revalidateContent("director", selectedDirector.id);

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const addActorToMovie = withMovieAuth(
  async (formData: FormData, movie: SelectMovie) => {
    const actorId = formData.get("actorId") as string;
    if (!actorId) {
      return { error: "Actor ID is required" };
    }

    try {
      // Check if actor exists
      const actorExists = await db.query.actor.findFirst({
        where: eq(actor.id, actorId),
      });

      if (!actorExists) {
        return { error: "Actor not found" };
      }

      // Check if association already exists
      const existingAssociation = await db.query.movieActors.findFirst({
        where: and(
          eq(movieActors.movieId, movie.id),
          eq(movieActors.actorId, actorId),
        ),
      });

      if (existingAssociation) {
        return { error: "Actor is already associated with this movie" };
      }

      // Create the association
      const [response] = await db
        .insert(movieActors)
        .values({
          movieId: movie.id,
          actorId: actorId,
        })
        .returning();

      // Comprehensive revalidation
      revalidateContent("movie", movie.id);
      revalidateTag(`actor-${actorId}-movies`);

      return response;
    } catch (error: any) {
      return { error: error.message };
    }
  },
);

// Remove actor from movie
export const removeActorFromMovie = async (
  movieId: string,
  actorId: string,
) => {
  try {
    const [response] = await db
      .delete(movieActors)
      .where(
        and(eq(movieActors.movieId, movieId), eq(movieActors.actorId, actorId)),
      )
      .returning();

    if (!response) {
      return { error: "Association not found" };
    }

    // Comprehensive revalidation
    revalidateContent("movie", movieId);
    revalidateTag(`actor-${actorId}-movies`);

    return response;
  } catch (error: any) {
    return { error: error.message };
  }
};

// Add director to a movie
export const addDirectorToMovie = withMovieAuth(
  async (formData: FormData, movie: SelectMovie) => {
    const directorId = formData.get("directorId") as string;
    if (!directorId) {
      return { error: "Director ID is required" };
    }

    try {
      // Check if director exists
      const directorExists = await db.query.director.findFirst({
        where: eq(director.id, directorId),
      });

      if (!directorExists) {
        return { error: "Director not found" };
      }

      // Check if association already exists
      const existingAssociation = await db.query.movieDirectors.findFirst({
        where: and(
          eq(movieDirectors.movieId, movie.id),
          eq(movieDirectors.directorId, directorId),
        ),
      });

      if (existingAssociation) {
        return { error: "Director is already associated with this movie" };
      }

      // Create the association
      const [response] = await db
        .insert(movieDirectors)
        .values({
          movieId: movie.id,
          directorId: directorId,
        })
        .returning();

      // Comprehensive revalidation
      revalidateContent("movie", movie.id);
      revalidateTag(`director-${directorId}-movies`);

      return response;
    } catch (error: any) {
      return { error: error.message };
    }
  },
);

// Remove director from movie
export const removeDirectorFromMovie = withMovieAuth(
  async (formData: FormData, movie: SelectMovie) => {
    const directorId = formData.get("directorId") as string;
    if (!directorId) {
      return { error: "Director ID is required" };
    }

    try {
      const [response] = await db
        .delete(movieDirectors)
        .where(
          and(
            eq(movieDirectors.movieId, movie.id),
            eq(movieDirectors.directorId, directorId),
          ),
        )
        .returning();

      if (!response) {
        return { error: "Association not found" };
      }

      // Comprehensive revalidation
      revalidateContent("movie", movie.id);
      revalidateTag(`director-${directorId}-movies`);

      return response;
    } catch (error: any) {
      return { error: error.message };
    }
  },
);

export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const value = formData.get(key) as string;

  try {
    const [response] = await db
      .update(users)
      .set({
        [key]: value,
      })
      .where(eq(users.id, session.user.id))
      .returning();

    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};
