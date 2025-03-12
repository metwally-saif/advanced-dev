"use client";

import { useState, useEffect } from "react";

type Entity = {
  id: string;
  name: string;
  [key: string]: any;
};

interface SearchDropdownProps<T extends Entity> {
  name: string;
  placeholder: string;
  defaultValue: string;
  searchFunction: (query: string) => Promise<T[]>;
  onSelect: (id: string) => void;
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
          className="py-2.5 sm:py-3 ps-4 pe-9 block w-full border border-stone-300 rounded-lg sm:text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute top-1/2 end-3 -translate-y-1/2">
          <svg className="shrink-0 size-3.5 text-gray-500 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 15 5 5 5-5"></path>
            <path d="m7 9 5-5 5 5"></path>
          </svg>
        </div>
      </div>
      
      {results.length > 0 && search && (
        <div className="absolute z-50 w-full max-h-72 mt-1 p-1 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto dark:bg-neutral-900 dark:border-neutral-700">
          {results.map((item) => (
            <div 
              key={item.id}
              className="cursor-pointer py-2 px-4 w-full text-sm text-gray-800 hover:bg-gray-100 rounded-lg dark:hover:bg-neutral-800 dark:text-neutral-200"
              onClick={() => {
                // Update the hidden input with the selected ID
                const hiddenInput = document.getElementById(`selected-${name}-id`) as HTMLInputElement;
                if (hiddenInput) hiddenInput.value = item.id;
                
                // Update the search field to show the selected name
                setSearch(item.name || "");
                
                // Clear the dropdown
                setResults([]);
                
                // Call the onSelect callback
                onSelect(item.id);
              }}
            >
              <div className="flex justify-between items-center w-full">
                <span>{item.name}</span>
                {item.id === defaultValue && (
                  <span>
                    <svg className="shrink-0 size-3.5 text-blue-600 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"></path>
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