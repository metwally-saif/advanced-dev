"use client";
import React from 'react'
import BlurImage from "@/components/blur-image";
import { SelectMovie } from '@/lib/schema';


function PersonsList(

{    
  title,
  persons,
    data,
    removePerson}
    : {
      title: string;
    persons: {
      id: string;
      name: string | null;
      image: string | null;
    }[];
    data: SelectMovie;
    removePerson: any;
    }
)  {
  return (
    <div className="flex flex-col space-y-2">
    <h2 className="font-cal text-xl dark:text-white">{title}</h2>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {persons.map((person) => (
        <div key={person.id} className="flex flex-col space-y-2 relative">
<BlurImage 
src={person.image!}
alt={person.name!}
width={50}
height={50}
className="rounded-full h-16 w-16 object-cover"
/>
          <p className="font-cal text-lg dark:text-white">{person.name}</p>
          <button
          type='button'
            onClick={() => removePerson(data.id, person.id)}
            className="flex items-center justify-center w-8 h-8 rounded-full  absolute top-0 right-24 bg-red-500 text-white dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700"
          >
            X
          </button>
        </div>
      ))}
      {persons.length === 0 && (
        <p className="text-stone-500 dark:text-stone-400">
          No {title.toLowerCase()} added yet.
        </p>
      )}
    </div>
  </div>
        )
}

export default PersonsList