import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";
import MovieCard from "./post-card";

export default async function Movies({
  limit,
}: {
  limit?: number;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/app/login");
  }

  const userMovies = await db.query.Movies.findMany({
    where: (movies, { and, eq }) =>
      and(
        eq(movies.userId, session.user.id),
      ),
    orderBy: (movies, { desc }) => desc(movies.updatedAt),
    ...(limit ? { limit } : {}),
  });

  return userMovies.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {userMovies.map((post) => (
        <MovieCard key={post.id} data={post} />
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
