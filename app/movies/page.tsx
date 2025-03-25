/* eslint-disable react/no-array-index-key */
import { Star, StarHalf } from "lucide-react";
import Image from "next/image";

import ClientGenreFilter from "@/components/client-genre-filter";
import { Link } from "@/components/link";
import { getSession } from "@/lib/auth";
import { getMoviesByRating } from "@/lib/fetchers";
import { genres } from "@/lib/schema";
import { toDateString } from "@/lib/utils";

// Get all possible genre values from the enum
const genreOptions = Object.values(genres.enumValues);

// This is now a server component
export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page || 1);
  const genre = searchParams.genre as string | undefined;

  const session = await getSession();
  const userId = session?.user?.id;

  // Fetch movies with the specified filters - now directly in the page component
  const { movies, pagination } = await getMoviesByRating(
    page,
    12, // 12 movies per page
    genre,
    userId,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-start justify-between md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800 md:text-4xl dark:text-gray-100">
            Top Rated Movies
          </h1>
          <p className="max-w-2xl text-gray-600 dark:text-gray-400">
            Explore our collection of top-rated movies, sorted by audience
            ratings.
          </p>
        </div>

        {/* Client component for interactive genre filter */}
        <div className="mt-4 md:mt-0">
          <ClientGenreFilter currentGenre={genre} genreOptions={genreOptions} />
        </div>
      </div>

      {/* Main content */}
      <div className="mb-8">
        {movies.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                userRating={movie.userRating}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
              <span className="text-5xl">🎬</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
              No movies found
            </h2>
            <p className="max-w-md text-gray-600 dark:text-gray-400">
              {genre
                ? `We couldn't find any ${genre} movies. Try selecting a different genre.`
                : "We couldn't find any movies. Please check back later."}
            </p>
            {genre && (
              <Link
                prefetch={true}
                href="/movies"
                className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Clear filter
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          genre={genre}
        />
      )}
    </div>
  );
}

// Movie card component (server component)
function MovieCard({
  movie,
  userRating,
}: {
  movie: any;
  userRating: number | null;
}) {
  return (
    <Link
      prefetch={true}
      href={`/movies/${movie.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800"
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={movie.image || null}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 w-full p-4">
            <p className="line-clamp-3 text-sm text-white">
              {movie.description}
            </p>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute right-2 top-2 flex items-center space-x-1 rounded-md bg-black/70 px-2 py-1 text-white">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold">
            {movie.averageRating ? movie.averageRating : "N/A"}
          </span>
          <span className="text-xs text-gray-300">
            ({movie.ratingCount || 0})
          </span>
        </div>

        {/* User rating badge if present */}
        {userRating && (
          <div className="absolute left-2 top-2 flex items-center space-x-1 rounded-md bg-blue-600/90 px-2 py-1 text-white">
            <span className="text-xs font-medium">Your rating:</span>
            <span className="text-sm font-bold">{userRating}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {movie.title}
        </h3>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {movie.genre} • {toDateString(movie.createdAt)}
        </p>

        {/* Star rating display */}
        <div className="flex items-center">
          <RatingStars rating={movie.averageRating || 0} />
        </div>
      </div>
    </Link>
  );
}

// Star rating component (server component)
function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={`${i}-ga`}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
            />
          );
        } else if (i === fullStars && hasHalfStar) {
          return (
            <StarHalf
              key={`${i}-ga`}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
            />
          );
        } else {
          return <Star key={`${i}-ga`} className="h-4 w-4 text-gray-300" />;
        }
      })}
    </div>
  );
}

// Pagination component (server component)
function Pagination({
  currentPage,
  totalPages,
  genre,
}: {
  currentPage: number;
  totalPages: number;
  genre?: string;
}) {
  // Generate page links
  const getPageLink = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (genre) {
      params.set("genre", genre);
    }
    return `/movies?${params.toString()}`;
  };

  return (
    <div className="mt-8 flex justify-center">
      <nav className="inline-flex rounded-md shadow">
        {/* Previous page button */}
        {currentPage > 1 && (
          <Link
            prefetch={true}
            href={getPageLink(currentPage - 1)}
            className="rounded-l-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Previous
          </Link>
        )}

        {/* Page numbers */}
        {[...Array(totalPages)].map((_, i) => (
          <Link
            prefetch={true}
            key={`page-${i}`}
            href={getPageLink(i + 1)}
            className={`border border-gray-300 px-3 py-2 dark:border-gray-600 ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {i + 1}
          </Link>
        ))}

        {/* Next page button */}
        {currentPage < totalPages && (
          <Link
            prefetch={true}
            href={getPageLink(currentPage + 1)}
            className="rounded-r-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
