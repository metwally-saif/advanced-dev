import { and, desc, eq, sql } from "drizzle-orm";
import { Star } from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Link } from "@/components/link";
import db from "@/lib/db";
import { director, movieDirectors, Movies, ratings, users } from "@/lib/schema";
import { toDateString } from "@/lib/utils";

// Create a specific fetcher for director data with movies
async function getDirectorById(
  id: string,
  page: number = 1,
  limit: number = 5,
) {
  return await unstable_cache(
    async () => {
      // Get director details
      const directorData = await db.query.director.findFirst({
        where: eq(director.id, id),
      });

      if (!directorData) {
        return null;
      }

      // Get all movies this director appears in with ratings
      const moviesWithRatings = await db
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
            name: users.name,
            image: users.image,
          },
        })
        .from(movieDirectors)
        .innerJoin(Movies, eq(movieDirectors.movieId, Movies.id))
        .leftJoin(ratings, eq(ratings.movieId, Movies.id))
        .leftJoin(users, eq(Movies.userId, users.id))
        .where(
          and(eq(movieDirectors.directorId, id), eq(Movies.published, true)),
        )
        .groupBy(
          Movies.id,
          Movies.title,
          Movies.description,
          Movies.slug,
          Movies.image,
          Movies.createdAt,
          Movies.genre,
          users.name,
          users.image,
        )
        .orderBy(desc(sql`avg(${ratings.rating})`));

      // Format movies with proper rating display
      const formattedMovies = moviesWithRatings.map((movie) => ({
        ...movie,
        averageRating: movie.averageRating
          ? parseFloat(Number(movie.averageRating).toFixed(1))
          : null,
      }));

      // Calculate pagination for all movies
      const offset = (page - 1) * limit;
      const totalMovies = formattedMovies.length;
      const totalPages = Math.ceil(totalMovies / limit);

      // Get top 4 movies for "Known For" section
      const topMovies = formattedMovies.slice(0, 4);

      // Get paginated movies for filmography section
      const paginatedMovies = formattedMovies.slice(offset, offset + limit);

      return {
        director: directorData,
        topMovies,
        allMovies: {
          movies: paginatedMovies,
          pagination: {
            page,
            limit,
            totalItems: totalMovies,
            totalPages,
          },
        },
      };
    },
    [`director-detail-${id}-${page}-${limit}`],
    {
      revalidate: 900, // 15 minutes
      tags: [`director-${id}`],
    },
  )();
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const id = decodeURIComponent(resolvedParams.id);
  const data = await getDirectorById(id);

  if (!data) {
    return { title: "director Not Found" };
  }

  return {
    title: data.director.name,
    description:
      data.director.description || `Information about ${data.director.name}`,
    openGraph: {
      images: [{ url: data.director.image || "/placeholder-director.jpg" }],
    },
  };
}

export default async function directorPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = decodeURIComponent(resolvedParams.id);
  const page = Number(searchParams.page || 1);
  const directorData = await getDirectorById(id, page, 5);

  if (!directorData) {
    notFound();
  }

  const { director, topMovies, allMovies } = directorData;
  const hasMedia =
    director.media &&
    Array.isArray(director.media) &&
    director.media.length > 0;

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      {/* director Header Section */}
      <div className="mb-12 flex flex-col gap-8 md:flex-row">
        {/* director Image */}
        <div className="w-full flex-shrink-0 md:w-1/3 lg:w-1/4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={director.image || "/placeholder-director.jpg"}
              alt={director.name!}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
              priority
            />
          </div>
        </div>

        {/* director Info */}
        <div className="flex-1">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
            {director.name}
          </h1>

          {director.age && (
            <p className="mb-3 text-gray-700 dark:text-gray-300">
              <span className="font-medium">Age:</span> {director.age} years
            </p>
          )}

          {director.birthdate && (
            <p className="mb-3 text-gray-700 dark:text-gray-300">
              <span className="font-medium">Born:</span>{" "}
              {toDateString(director.birthdate)}
            </p>
          )}

          <div className="mt-6">
            <p className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Appears in {allMovies.pagination.totalItems} movies
            </p>
          </div>
        </div>
      </div>

      {/* Media Gallery Section (if available) */}
      {hasMedia && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Media Gallery
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {director?.media?.map((mediaUrl, index) => (
              <div
                key={mediaUrl}
                className="relative aspect-video overflow-hidden rounded-lg shadow-md"
              >
                <Image
                  src={mediaUrl}
                  alt={`${director.name} media ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Description Section */}
      {director.description && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Biography
          </h2>
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-gray-700 dark:text-gray-300">
              {director.description}
            </p>
          </div>
        </section>
      )}

      {/* Known For Section */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Known For
        </h2>
        {topMovies.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {topMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="italic text-gray-600 dark:text-gray-400">
            No featured movies available.
          </p>
        )}
      </section>

      {/* Filmography Section */}
      <section>
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Filmography
          </h2>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {allMovies.pagination.totalItems} movies
          </div>
        </div>

        {/* Movie List */}
        <div className="space-y-6">
          {allMovies.movies.length > 0 ? (
            allMovies.movies.map((movie) => (
              <MovieListItem key={movie.id} movie={movie} />
            ))
          ) : (
            <p className="italic text-gray-600 dark:text-gray-400">
              No movies available.
            </p>
          )}
        </div>

        {/* Pagination */}
        {allMovies.pagination.totalPages > 1 && (
          <Pagination
            currentPage={allMovies.pagination.page}
            totalPages={allMovies.pagination.totalPages}
            directorId={id}
          />
        )}
      </section>
    </div>
  );
}

// Movie Card Component for "Known For" section
function MovieCard({ movie }: { movie: any }) {
  return (
    <Link
      href={`/movies/${movie.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
    >
      <div className="relative aspect-[2/3]">
        <Image
          src={movie.image || "/placeholder-movie.jpg"}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 250px"
        />

        {/* Rating badge */}
        {movie.averageRating && (
          <div className="absolute right-2 top-2 flex items-center space-x-1 rounded-md bg-black/70 px-2 py-1 text-white">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold">{movie.averageRating}</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-1 font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {movie.title}
        </h3>
        <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
          {movie.genre}
        </p>
      </div>
    </Link>
  );
}

// Movie List Item Component for Filmography section
function MovieListItem({ movie }: { movie: any }) {
  return (
    <Link
      href={`/movies/${movie.slug}`}
      className="group flex items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/60"
    >
      {/* Movie thumbnail */}
      <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded">
        <Image
          src={movie.image || "/placeholder-movie.jpg"}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Movie info */}
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {movie.title}
        </h3>
        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
          {movie.genre} • {toDateString(movie.createdAt)}
        </p>
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {movie.description}
        </p>
      </div>

      {/* Rating */}
      {movie.averageRating && (
        <div className="flex flex-shrink-0 items-center">
          <div className="flex items-center space-x-1 rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium">{movie.averageRating}</span>
          </div>
        </div>
      )}
    </Link>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  directorId,
}: {
  currentPage: number;
  totalPages: number;
  directorId: string;
}) {
  // Generate page links
  const getPageLink = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    return `/directors/${directorId}?${params.toString()}`;
  };

  // Create array of page numbers to display
  const pageNumbers: (string | number)[] = [];
  let lastPageNum = 0; // Track the last numeric page added

  // Always show first, last, current, and 1 page before/after current
  const pagesToShow = new Set([
    1, // First page
    totalPages, // Last page
    currentPage, // Current page
    currentPage - 1, // Previous page
    currentPage + 1, // Next page
  ]);

  // Filter out invalid page numbers and sort
  Array.from(pagesToShow)
    .filter((num) => num >= 1 && num <= totalPages)
    .sort((a, b) => a - b)
    .forEach((pageNum) => {
      // Add ellipsis if there's a gap
      if (lastPageNum > 0 && pageNum - lastPageNum > 1) {
        pageNumbers.push("ellipsis");
      }
      pageNumbers.push(pageNum);
      lastPageNum = pageNum;
    });

  return (
    <nav className="mb-4 mt-8 flex justify-center" aria-label="Pagination">
      <ul className="flex items-center space-x-2">
        {/* Previous button */}
        {currentPage > 1 && (
          <li>
            <Link
              href={getPageLink(currentPage - 1)}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Previous
            </Link>
          </li>
        )}

        {/* Page numbers */}
        {pageNumbers.map((pageNum, index) =>
          pageNum === "ellipsis" ? (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`ellipsis-${index}`} className="px-2 text-gray-500">
              ...
            </li>
          ) : (
            <li key={pageNum}>
              <Link
                href={getPageLink(pageNum as number)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {pageNum}
              </Link>
            </li>
          ),
        )}

        {/* Next button */}
        {currentPage < totalPages && (
          <li>
            <Link
              href={getPageLink(currentPage + 1)}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Next
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
