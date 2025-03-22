"use client";

import { useEffect, useState } from "react";

type Entity = {
  id: string;
  name: string;
  [key: string]: any;
};

interface SearchDropdownProps<T extends Entity> {
  name: string;
  placeholder: string;
  defaultValue: string;
  searchFunction: (_query: string) => Promise<T[]>;
  onSelect: (_id: string) => void;
}

export default function SearchDropdown<T extends Entity>({
  name,
  placeholder,
  defaultValue,
  searchFunction,
  onSelect,
}: SearchDropdownProps<T>) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<T[]>([]);

  useEffect(() => {
    if (search.trim()) {
      searchFunction(search).then((res) => {
        setResults(res);
      });
    } else {
      setResults([]);
    }
  }, [search, searchFunction]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          className="block w-full rounded-lg border border-stone-300 py-2.5 pe-9 ps-4 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-stone-500 sm:py-3 sm:text-sm dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute end-3 top-1/2 -translate-y-1/2">
          <svg
            className="size-3.5 shrink-0 text-gray-500 dark:text-neutral-500"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </div>
      </div>

      {results.length > 0 && search && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
          {results.map((item) => (
            <div
              key={item.id}
              className="w-full cursor-pointer rounded-lg px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              onClick={() => {
                // Update the hidden input with the selected ID
                const hiddenInput = document.getElementById(
                  `selected-${name}-id`,
                ) as HTMLInputElement;
                if (hiddenInput) {
                  hiddenInput.value = item.id;
                }

                // Update the search field to show the selected name
                setSearch(item.name || "");

                // Clear the dropdown
                setResults([]);

                // Call the onSelect callback
                onSelect(item.id);
              }}
            >
              <div className="flex w-full items-center justify-between">
                <span>{item.name}</span>
                {item.id === defaultValue && (
                  <span>
                    <svg
                      className="size-3.5 shrink-0 text-blue-600 dark:text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden input to store the selected ID for form submission */}
      <input
        type="hidden"
        id={`selected-${name}-id`}
        name={name}
        defaultValue={defaultValue}
      />
    </div>
  );
}
