"use server";

import { unstable_cache } from "next/cache";
import db from "./db";
import { desc, ilike } from "drizzle-orm";
import { actor, director, Movies } from "./schema";


export async function searchActorsByName(name: string) {
    try {
      // Define the actual data fetching logic separately
      const fetchActors = async () => {
        return await db
          .select({
            id: actor.id,
            name: actor.name,
            image: director.image,
          })
          .from(actor)
          .where(ilike(actor.name, `%${name}%`));
      };

      // Try to use the cache if available
      try {
        return await unstable_cache(
          fetchActors,
          [`search-actors-${name}`],
          {
            revalidate: 900,
            tags: [`search-actors-${name}`],
          }
        )();
      } catch (cacheError) {
        // If cache fails, just execute the query directly
        console.warn("Cache unavailable, running direct query", cacheError);
        return await fetchActors();
      }
    } catch (error) {
      console.error("Error searching actors:", error);
      return [];
    }
  }

  export async function searchDirectorsByName(name: string) {
    return await unstable_cache(
      async () => {
        return await db
          .select({
            id: director.id,
            name: director.name,
            image: director.image,
          })
          .from(director)
          .where(
            ilike(director.name, `%${name}%`),
          );
      },
      [`search-directors-${name}`],
      {
        revalidate: 900, // 15 minutes
        tags: [`search-directors-${name}`],
      },
    )();
  }

  export async function searchMoviesByTitle(title: string) {
    return await unstable_cache(
      async () => {
        return await db
          .select({
            id: Movies.id,
            title: Movies.title,
            description: Movies.description,
            slug: Movies.slug,
            image: Movies.image,
          })
          .from(Movies)
          .where(
            ilike(Movies.title, `%${title}%`),
          );
      },
      [`search-movies-${title}`],
      {
        revalidate: 900, // 15 minutes
        tags: [`search-movies-${title}`],
      },
    )();
  }
