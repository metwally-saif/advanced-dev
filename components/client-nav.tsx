"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { searchActorsByName, searchDirectorsByName, searchMoviesByTitle } from '@/lib/search-functions';
import { SelectActor, SelectMovie, SelectDirector } from '@/lib/schema';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { placeholderBlurhash } from '@/lib/utils';


interface searchResults {
  actors: Partial<SelectActor>[];
  directors: Partial<SelectDirector>[];
  movies: Partial<SelectMovie>[];
}

function ClientNav() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<searchResults>
  ({ actors: [], directors: [], movies: [] });
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dynamic path detection
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          searchMoviesByTitle(debouncedSearchTerm)
        ]);

        setSearchResults({
          actors: actorsRes?.slice(0, 3) || [],
          directors: directorsRes?.slice(0, 3) || [],
          movies: moviesRes?.slice(0, 3) || []
        });
      } catch (error) {
        console.error('Search error:', error);
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
  const hasResults = searchResults.actors.length > 0 ||
                     searchResults.directors.length > 0 ||
                     searchResults.movies.length > 0;


  if (pathname.includes('/app') || pathname.includes('/login')) return

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-gray-800 dark:bg-gray-950 shadow-lg"
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <motion.span
            className={`self-center text-2xl font-semibold whitespace-nowrap ${
              isActive('/') ? 'text-blue-500 dark:text-blue-400' : 'text-gray-100 dark:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            MovieDB
          </motion.span>
        </Link>

        {/* Search component */}
        <div className="flex md:order-2 relative" ref={searchRef}>
          <div className="relative">
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.03 }}
            >
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={handleSearchClick}
                className="block w-full p-2 ps-10 text-sm text-white border border-gray-600 rounded-lg bg-gray-700 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="Search movies, actors..."
              />
              {isLoading && (
                <div className="absolute inset-y-0 end-0 flex items-center pe-3">
                  <div className="w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.div>

            {/* Search Results Dropdown */}
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute mt-2 w-80 max-h-80 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-50"
              >
                {!hasResults && searchTerm.length >= 2 && !isLoading ? (
                  <div className="p-4 text-center text-gray-300">
                    No results found for "{searchTerm}"
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
                        <div className="px-4 py-2 border-b border-gray-600 bg-gray-800">
                          <p className="text-xs font-semibold text-gray-400">MOVIES</p>
                        </div>
                        {searchResults.movies.map((movie: any) => (
                          <Link
                            href={`/movies/${movie.slug}`}
                            key={movie.id}
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <motion.div
                              whileHover={{ backgroundColor: 'rgba(55, 65, 81, 1)' }}
                              className="flex items-center px-4 py-2 border-b border-gray-600 hover:bg-gray-600"
                            >
                              <div className="w-10 h-14 relative flex-shrink-0 overflow-hidden rounded">
                                <Image
                                  src={movie.image || placeholderBlurhash}
                                  alt={movie.title}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-white">{movie.title}</p>
                                <p className="text-xs text-gray-300 line-clamp-1">{movie.description}</p>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Actors Section */}
                    {searchResults.actors.length > 0 && (
                      <div>
                        <div className="px-4 py-2 border-b border-gray-600 bg-gray-800">
                          <p className="text-xs font-semibold text-gray-400">ACTORS</p>
                        </div>
                        {searchResults.actors.map((actor: any) => (
                          <Link
                            href={`/actors/${actor.name}`}
                            key={actor.id}
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <motion.div
                              whileHover={{ backgroundColor: 'rgba(55, 65, 81, 1)' }}
                              className="flex items-center px-4 py-2 border-b border-gray-600 hover:bg-gray-600"
                            >
                              <div className="w-10 h-10 relative flex-shrink-0 rounded-full overflow-hidden">
                                <Image
                                  src={actor.image || placeholderBlurhash}
                                  alt={actor.name}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                              <p className="ml-3 text-sm font-medium text-white">{actor.name}</p>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Directors Section */}
                    {searchResults.directors.length > 0 && (
                      <div>
                        <div className="px-4 py-2 border-b border-gray-600 bg-gray-800">
                          <p className="text-xs font-semibold text-gray-400">DIRECTORS</p>
                        </div>
                        {searchResults.directors.map((director: any) => (
                          <Link
                            href={`/directors/${director.name}`}
                            key={director.id}
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <motion.div
                              whileHover={{ backgroundColor: 'rgba(55, 65, 81, 1)' }}
                              className="flex items-center px-4 py-2 border-b border-gray-600 hover:bg-gray-600"
                            >
                              <div className="w-10 h-10 relative flex-shrink-0 rounded-full overflow-hidden">
                                <Image
                                  src={director.image || placeholderBlurhash}
                                  alt={director.name}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                              <p className="ml-3 text-sm font-medium text-white">{director.name}</p>
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
            className="md:hidden ml-2 p-2.5 text-sm font-medium text-white bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-800"
            onClick={() => document.getElementById('navbar-links')?.classList.toggle('hidden')}
          >{""}
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-links">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-700 rounded-lg bg-gray-800 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-950 dark:border-gray-800">
            {[
              { path: '/movies', name: 'Movies' },
              { path: '/actors', name: 'Actors' },
              { path: '/directors', name: 'Directors' }
            ].map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <motion.div
                    className={`block py-2 px-3 rounded-md text-sm ${
                      isActive(item.path)
                        ? 'text-blue-500 dark:text-blue-400 font-bold'
                        : 'text-gray-300 hover:text-white dark:text-gray-300 dark:hover:text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
                    {isActive(item.path) && (
                      <motion.div
                        className="h-0.5 bg-blue-500 dark:bg-blue-400 mt-0.5"
                        layoutId="underline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
