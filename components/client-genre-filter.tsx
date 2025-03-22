"use client";

import React from "react";

export default function ClientGenreFilter({
  currentGenre,
  genreOptions,
}: {
  currentGenre?: string;
  genreOptions: string[];
}) {
  return (
    <div className="relative">
      <form
        action="/movies"
        method="get"
        className="flex items-center space-x-2"
      >
        <label
          htmlFor="genre"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Filter by:
        </label>
        <select
          id="genre"
          name="genre"
          defaultValue={currentGenre || ""}
          onChange={(e) => {
            // Auto-submit when selection changes
            const form = e.target.form;
            if (form) {
              form.submit();
            }
          }}
          className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <option value="">All Genres</option>
          {genreOptions.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}
