import { isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";

import BlurImage from "@/components/blur-image";
import {
  MovieReviewForm,
  MovieReviewsList,
} from "@/components/form/movie-rating-form";
import MDX from "@/components/mdx";
import MovieCard from "@/components/movie-card";
import MovieRating from "@/components/movie-rating";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import {
  getMovieActors,
  getMovieData,
  getMovieDirectors,
} from "@/lib/fetchers";
import { Movies } from "@/lib/schema";
import { toDateString } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug);
  const data = await getMovieData(slug);

  if (!data) {
    return null;
  }
  const { title, description } = data;

  return {
    title,
    description,
    image: data.image,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: data.user?.name,
      image: data.image,
    },
  };
}

export async function generateStaticParams() {
  try {
    const allPosts = await db
      .select({
        slug: Movies.slug,
      })
      .from(Movies)
      .where(isNotNull(Movies.slug));

    const allPaths = allPosts
      .flatMap(({ slug }) => [
        slug && {
          slug: slug,
        },
      ])
      .filter(Boolean);

    return allPaths;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error searching movies:", error);
    return [];
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug);
  const session = await getSession();
  const data = await getMovieData(slug, session);

  if (!data) {
    notFound();
  }

  // Fetch actors and directors for this movie
  const [actors, directors] = await Promise.all([
    getMovieActors(data.id!),
    getMovieDirectors(data.id!),
  ]);

  // Check if current user has already reviewed this movie
  const userHasReviewed = data.reviews.some(
    (review: any) => review.user.id === session?.user?.id,
  );

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="m-auto w-full text-center md:w-7/12">
          <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 md:text-base dark:text-stone-400">
            {toDateString(data.createdAt ?? new Date())}
          </p>
          <h1 className="mb-6 font-title text-3xl font-bold text-stone-800 md:text-6xl dark:text-white">
            {data.title}
          </h1>

          {/* Rating component */}
          <div className="mb-6">
            <MovieRating
              movieId={data.id!}
              initialRating={data.ratings.userRating}
              ratingId={data.ratings.userRatingId}
              userLoggedIn={!!session?.user}
              averageRating={data.ratings.average}
              ratingCount={data.ratings.count}
            />
          </div>

          <p className="text-md m-auto mb-10 w-10/12 text-stone-600 md:text-lg dark:text-stone-400">
            {data.description}
          </p>
        </div>
      </div>

      <div className="relative m-auto mb-10 h-80 w-full max-w-screen-lg overflow-hidden md:mb-20 md:h-150 md:w-5/6 md:rounded-2xl lg:w-2/3">
        <BlurImage
          alt={data.title ?? "Post image"}
          width={1200}
          height={630}
          className="h-full w-full object-cover"
          src={data.image ?? "/placeholder.png"}
        />
      </div>

      <div className="m-auto w-full max-w-3xl px-4">
        {/* Cast & Crew Section */}
        {((Array.isArray(actors) && actors.length > 0) ||
          (Array.isArray(directors) && directors.length > 0)) && (
          <div className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Cast & Crew
            </h2>

            {/* Actors Section */}
            {Array.isArray(actors) && actors.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Actors
                </h3>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {actors.map((actor) => (
                    <div key={actor.id} className="flex-shrink-0">
                      <a href={`/actors/${actor.id}`} className="block">
                        <div className="flex flex-col items-center">
                          <div className="h-24 w-24 overflow-hidden rounded-full">
                            <BlurImage
                              src={actor.image || "/placeholder-actor.jpg"}
                              alt={actor.name || "Actor"}
                              width={96}
                              height={96}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                            {actor.name}
                          </span>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Directors Section */}
            {Array.isArray(directors) && directors.length > 0 && (
              <div>
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Directors
                </h3>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {directors.map((director) => (
                    <div key={director.id} className="flex-shrink-0">
                      <a href={`/directors/${director.id}`} className="block">
                        <div className="flex flex-col items-center">
                          <div className="h-24 w-24 overflow-hidden rounded-full">
                            <BlurImage
                              src={
                                director.image || "/placeholder-director.jpg"
                              }
                              alt={director.name || "Director"}
                              width={96}
                              height={96}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                            {director.name}
                          </span>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <MDX source={data.mdxSource} />

        {/* Reviews section */}
        <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reviews
          </h2>

          {/* Review form */}
          <MovieReviewForm
            movieId={data.id!}
            slug={data.slug!}
            userLoggedIn={!!session?.user}
            userHasReviewed={userHasReviewed}
          />

          {/* Reviews list */}
          <MovieReviewsList
            reviews={data.reviews}
            slug={data.slug!}
            currentUserId={session?.user?.id}
          />
        </div>
      </div>

      {data.adjacentPosts.length > 0 && (
        <div className="relative mb-20 mt-20">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-stone-300 dark:border-stone-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-stone-500 dark:bg-black dark:text-stone-400">
              Continue Watching
            </span>
          </div>
        </div>
      )}

      {data.adjacentPosts && (
        <div className="mx-5 mb-20 grid max-w-screen-xl grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:mx-auto xl:grid-cols-3">
          {data.adjacentPosts.map((post: any, _: number) => (
            <MovieCard key={`${post.slug}`} data={post} />
          ))}
        </div>
      )}
    </>
  );
}
