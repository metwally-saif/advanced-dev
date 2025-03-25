"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { Link } from "@/components/link";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { SelectActor, SelectDirector, SelectMovie } from "@/lib/schema";
import {
  searchActorsByName,
  searchDirectorsByName,
  searchMoviesByTitle,
} from "@/lib/search-functions";
import { placeholderBlurhash } from "@/lib/utils";

interface searchResults {
  actors: Partial<SelectActor>[];
  directors: Partial<SelectDirector>[];
  movies: Partial<SelectMovie>[];
}
// eslint-disable-next-line complexity
function ClientNav() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<searchResults>({
    actors: [],
    directors: [],
    movies: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dynamic path detection
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") {
      return true;
    }
    if (path !== "/" && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults({ actors: [], directors: [], movies: [] });
        return;
      }

      setIsLoading(true);

      try {
        // Fetch all results in parallel
        const [actorsRes, directorsRes, moviesRes] = await Promise.all([
          searchActorsByName(debouncedSearchTerm),
          searchDirectorsByName(debouncedSearchTerm),
          searchMoviesByTitle(debouncedSearchTerm),
        ]);

        setSearchResults({
          actors: actorsRes?.slice(0, 3) || [],
          directors: directorsRes?.slice(0, 3) || [],
          movies: moviesRes?.slice(0, 3) || [],
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearchOpen(true);
  };

  // Check if there are any search results
  const hasResults =
    searchResults.actors.length > 0 ||
    searchResults.directors.length > 0 ||
    searchResults.movies.length > 0;

  if (pathname.includes("/app") || pathname.includes("/login")) {
    return;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-gray-800 shadow-lg dark:bg-gray-950"
    >
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link
          prefetch={true}
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <motion.span
            className={`self-center whitespace-nowrap text-2xl font-semibold ${
              isActive("/")
                ? "text-blue-500 dark:text-blue-400"
                : "text-gray-100 dark:text-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            MovieDB
          </motion.span>
        </Link>

        {/* Search component */}
        <div className="relative flex md:order-2" ref={searchRef}>
          <div className="relative">
            <motion.div className="relative" whileFocus={{ scale: 1.03 }}>
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-1">
                <svg
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={handleSearchClick}
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2 ps-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search movies, actors..."
              />
              {isLoading && (
                <div className="absolute inset-y-0 end-0 flex items-center pe-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-l-transparent border-r-transparent border-t-blue-500" />
                </div>
              )}
            </motion.div>

            {/* Search Results Dropdown */}
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-2 max-h-80 w-80 overflow-y-auto rounded-lg border border-gray-600 bg-gray-700 shadow-xl"
              >
                {!hasResults && searchTerm.length >= 2 && !isLoading ? (
                  <div className="p-4 text-center text-gray-300">
                    No results found for &quot{searchTerm}&quot
                  </div>
                ) : !hasResults && searchTerm.length < 2 ? (
                  <div className="p-4 text-center text-gray-300">
                    Type at least 2 characters to search
                  </div>
                ) : (
                  <div>
                    {/* Movies Section */}
                    {searchResults.movies.length > 0 && (
                      <div>
                        <div className="border-b border-gray-600 bg-gray-800 px-4 py-2">
                          <p className="text-xs font-semibold text-gray-400">
                            MOVIES
                          </p>
                        </div>
                        {searchResults.movies.map((movie: any) => (
                          <Link
                            prefetch={true}
                            href={`/movies/${movie.slug}`}
                            key={movie.id}
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <motion.div
                              whileHover={{
                                backgroundColor: "rgba(55, 65, 81, 1)",
                              }}
                              className="flex items-center border-b border-gray-600 px-4 py-2 hover:bg-gray-600"
                            >
                              <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded">
                                <Image
                                  src={movie.image || placeholderBlurhash}
                                  alt={movie.title}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                  {movie.title}
                                </p>
                                <p className="line-clamp-1 text-xs text-gray-300">
                                  {movie.description}
                                </p>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Actors Section */}
                    {searchResults.actors.length > 0 && (
                      <div>
                        <div className="border-b border-gray-600 bg-gray-800 px-4 py-2">
                          <p className="text-xs font-semibold text-gray-400">
                            ACTORS
                          </p>
                        </div>
                        {searchResults.actors.map((actor: any) => (
                          <Link
                            prefetch={true}
                            href={`/actors/${actor.name}`}
                            key={actor.id}
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <motion.div
                              whileHover={{
                                backgroundColor: "rgba(55, 65, 81, 1)",
                              }}
                              className="flex items-center border-b border-gray-600 px-4 py-2 hover:bg-gray-600"
                            >
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                                <Image
                                  src={actor.image || placeholderBlurhash}
                                  alt={actor.name}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                              <p className="ml-3 text-sm font-medium text-white">
                                {actor.name}
                              </p>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Directors Section */}
                    {searchResults.directors.length > 0 && (
                      <div>
                        <div className="border-b border-gray-600 bg-gray-800 px-4 py-2">
                          <p className="text-xs font-semibold text-gray-400">
                            DIRECTORS
                          </p>
                        </div>
                        {searchResults.directors.map((director: any) => (
                          <Link
                            prefetch={true}
                            href={`/directors/${director.name}`}
                            key={director.id}
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <motion.div
                              whileHover={{
                                backgroundColor: "rgba(55, 65, 81, 1)",
                              }}
                              className="flex items-center border-b border-gray-600 px-4 py-2 hover:bg-gray-600"
                            >
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                                <Image
                                  src={director.image || placeholderBlurhash}
                                  alt={director.name}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                              <p className="ml-3 text-sm font-medium text-white">
                                {director.name}
                              </p>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <button
            type="button"
            className="ml-2 rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-800 md:hidden"
            onClick={() =>
              document
                .getElementById("navbar-links")
                ?.classList.toggle("hidden")
            }
          >
            {""}
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className="hidden w-full items-center justify-between md:order-1 md:flex md:w-auto"
          id="navbar-links"
        >
          <ul className="mt-4 flex flex-col rounded-lg border border-gray-700 bg-gray-800 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent md:p-0 dark:border-gray-800 dark:bg-gray-950">
            {[
              { path: "/movies", name: "Movies" },
              { path: "/actors", name: "Actors" },
              { path: "/directors", name: "Directors" },
            ].map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <motion.div
                    className={`block rounded-md px-3 py-2 text-sm ${
                      isActive(item.path)
                        ? "font-bold text-blue-500 dark:text-blue-400"
                        : "text-gray-300 hover:text-white dark:text-gray-300 dark:hover:text-white"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
                    {isActive(item.path) && (
                      <motion.div
                        className="mt-0.5 h-0.5 bg-blue-500 dark:bg-blue-400"
                        layoutId="underline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.nav>
  );
}

export default ClientNav;
