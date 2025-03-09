"use server";

import { getSession } from "@/lib/auth";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { revalidateTag } from "next/cache";
import { withPostAuth, withSiteAuth } from "./auth";
import db from "./db";
import { SelectMovie, Movies, users, actor, SelectActor, director, SelectDirector, reviews, SelectReview } from "./schema";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string



export const createMovie = withSiteAuth(
  async (_: FormData) => {
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
  },
);

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

export const updateMovieMetadata = withPostAuth(
  async (
    formData: FormData,
    post: SelectMovie,
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      let response;
      if (key === "image") {
        const file = formData.get("image") as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        const { url } = await put(filename, file, {
          access: "public",
        });

        response = await db
          .update(Movies)
          .set({
            image: url,
          })
          .where(eq(Movies.id, post.id))
          .returning()
          .then((res) => res[0]);
      } else {
        response = await db
          .update(Movies)
          .set({
            [key]: key === "published" ? value === "true" : value,
          })
          .where(eq(Movies.id, post.id))
          .returning()
          .then((res) => res[0]);
      }


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

export const deleteMovie = withPostAuth(
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


