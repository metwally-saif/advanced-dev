"use server";

import { unstable_cache } from "next/cache";
import db from "./db";
import { ilike } from "drizzle-orm";
import { actor, director } from "./schema";


export async function searchActorsByName(name: string) {
    try {
      // Define the actual data fetching logic separately
      const fetchActors = async () => {
        return await db
          .select({
            id: actor.id,
            name: actor.name,
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