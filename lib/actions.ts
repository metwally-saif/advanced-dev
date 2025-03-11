"use server";

import { getSession } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { revalidateTag } from "next/cache";
import { withMovieAuth, withActorAuth, withDirectorAuth } from "./auth";
import db from "./db";
import { SelectMovie, Movies, users, actor, SelectActor, director, SelectDirector, reviews, SelectReview, movieDirectors, movieActors } from "./schema";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string



export const createMovie = 
  async (_: FormData) : Promise<SelectMovie | { error: string }> => {
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

    revalidateTag(
      `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );

    return response;
  };

export const createActor = async  (_: FormData) : Promise<SelectActor | { error: string }> => {
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

  revalidateTag(
    `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-actors`,
  );

  return response;
};

export const createDirector = async (_: FormData) : Promise<SelectDirector | { error: string }> => {
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

  revalidateTag(
    `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-directors`,
  );

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
    where: eq(Movies.id, data.id)
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


    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updateMovieMetadata = withMovieAuth(
  async (
    formData: FormData,
    movie: SelectMovie,
    key: string,
  ) => {
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
  async (
    formData: FormData,
    selectedActor: SelectActor,
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      const response = await db
          .update(actor)
          .set({
            [key]: value,
          })
          .where(eq(actor.id, selectedActor.id))
          .returning()
          .then((res) => res[0]);
  
      return response;
    } catch (error: any) {

        return {
          error: error.message,
        };
      
    }
  }


);

export const updateDirectorMetadata = withDirectorAuth(
  async (
    formData: FormData,
    selectedDirector: SelectDirector,
    key: string,
  ) => {
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
      
      return response;
    } catch (error: any) {

        return {
          error: error.message,
        };
      
    }
  }
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

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  }
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

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  }
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

export const addActorToMovie = withMovieAuth(
  async (
    formData: FormData,
    movie: SelectMovie,
  ) => {
    const actorId = formData.get("actorId") as string;
    if (!actorId) {
      return { error: "Actor ID is required" };
    }

    try {
      // Check if actor exists
      const actorExists = await db.query.actor.findFirst({
        where: eq(actor.id, actorId)
      });
      
      if (!actorExists) {
        return { error: "Actor not found" };
      }
      
      // Check if association already exists
      const existingAssociation = await db.query.movieActors.findFirst({
        where: and(
          eq(movieActors.movieId, movie.id),
          eq(movieActors.actorId, actorId)
        )
      });
      
      if (existingAssociation) {
        return { error: "Actor is already associated with this movie" };
      }
      
      // Create the association
      const [response] = await db
        .insert(movieActors)
        .values({
          movieId: movie.id,
          actorId: actorId
        })
        .returning();
        
      revalidateTag(`movie-${movie.id}-actors`);
      return response;
    } catch (error: any) {
      return { error: error.message };
    }
  }
);

// Remove actor from movie
export const removeActorFromMovie = withMovieAuth(
  async (
    formData: FormData,
    movie: SelectMovie,
  ) => {
    const actorId = formData.get("actorId") as string;
    if (!actorId) {
      return { error: "Actor ID is required" };
    }
    
    try {
      const [response] = await db
        .delete(movieActors)
        .where(
          and(
            eq(movieActors.movieId, movie.id),
            eq(movieActors.actorId, actorId)
          )
        )
        .returning();
        
      if (!response) {
        return { error: "Association not found" };
      }
      
      revalidateTag(`movie-${movie.id}-actors`);
      return response;
    } catch (error: any) {
      return { error: error.message };
    }
  }
);

// Add director to a movie
export const addDirectorToMovie = withMovieAuth(
  async (
    formData: FormData,
    movie: SelectMovie,
  ) => {
    const directorId = formData.get("directorId") as string;
    if (!directorId) {
      return { error: "Director ID is required" };
    }

    try {
      // Check if director exists
      const directorExists = await db.query.director.findFirst({
        where: eq(director.id, directorId)
      });
      
      if (!directorExists) {
        return { error: "Director not found" };
      }
      
      // Check if association already exists
      const existingAssociation = await db.query.movieDirectors.findFirst({
        where: and(
          eq(movieDirectors.movieId, movie.id),
          eq(movieDirectors.directorId, directorId)
        )
      });
      
      if (existingAssociation) {
        return { error: "Director is already associated with this movie" };
      }
      
      // Create the association
      const [response] = await db
        .insert(movieDirectors)
        .values({
          movieId: movie.id,
          directorId: directorId
        })
        .returning();
        
      revalidateTag(`movie-${movie.id}-directors`);
      return response;
    } catch (error: any) {
      return { error: error.message };
    }
  }
);

// Remove director from movie
export const removeDirectorFromMovie = withMovieAuth(
  async (
    formData: FormData,
    movie: SelectMovie,
  ) => {
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
            eq(movieDirectors.directorId, directorId)
          )
        )
        .returning();
        
      if (!response) {
        return { error: "Association not found" };
      }
      
      revalidateTag(`movie-${movie.id}-directors`);
      return response;
    } catch (error: any) {
      return { error: error.message };
    }
  }
);
