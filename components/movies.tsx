import { desc } from "drizzle-orm";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { Movies } from "@/lib/schema";

import MovieCard from "./post-card";

export default async function MovieGallery({ limit }: { limit?: number }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/app/login");
  }
  const fetchedMovies = await db
    .select({
      id: Movies.id,
      title: Movies.title,
      description: Movies.description,
      content: Movies.content,
      createdAt: Movies.createdAt,
      updatedAt: Movies.updatedAt,
      userId: Movies.userId,
      slug: Movies.slug,
      genre: Movies.genre,
      rating: Movies.rating,
      image: Movies.image,
      published: Movies.published,
    })
    .from(Movies)
    .limit(limit ?? 10)
    .orderBy(desc(Movies.createdAt));

  return fetchedMovies.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {fetchedMovies.map((movie) => (
        <MovieCard key={movie.id} data={movie} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Movies Yet</h1>
      <Image
        alt="missing post"
        src="https://illustrations.popsy.co/gray/graphic-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any movies yet. Create one now!
      </p>
    </div>
  );
}
