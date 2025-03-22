"use client";

import { Star } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addOrUpdateRating } from "@/lib/actions";

export default function MovieRating({
  movieId,
  initialRating = null,
  ratingId = null,
  userLoggedIn = false,
  averageRating = null,
  ratingCount = 0,
}: {
  movieId: string;
  initialRating?: number | null;
  ratingId?: string | null;
  userLoggedIn?: boolean;
  averageRating?: number | null;
  ratingCount?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleRating = (value: number) => {
    if (!userLoggedIn) {
      toast.error("Please sign in to rate this movie");
      return;
    }

    setRating(value);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("movieId", movieId);
      formData.append("rating", value.toString());

      if (ratingId) {
        formData.append("ratingId", ratingId);
      }

      const result = await addOrUpdateRating(formData);

      if (result.error) {
        toast.error(result.error);
        setRating(initialRating); // Revert on error
      } else {
        toast.success("Rating submitted successfully");
      }
    });
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={isPending}
              onClick={() => handleRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(null)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
            >
              {""}
              <Star
                size={24}
                className={`
                  ${
                    (
                      hoveredRating !== null
                        ? value <= hoveredRating
                        : value <= (rating || 0)
                    )
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                  transition-colors
                `}
              />
            </button>
          ))}
        </div>

        {isPending && (
          <div className="ml-2 h-5 w-5 animate-spin rounded-full border-r-2 border-t-2 border-blue-500" />
        )}
      </div>

      {averageRating !== null && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {averageRating}
          </span>
          <span>
            {" "}
            ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
          </span>
        </div>
      )}

      {userLoggedIn && rating && (
        <div className="text-sm text-blue-600 dark:text-blue-400">
          Your rating: {rating}/5
        </div>
      )}

      {!userLoggedIn && (
        <div className="text-sm italic text-gray-500 dark:text-gray-400">
          Sign in to rate this movie
        </div>
      )}
    </div>
  );
}
