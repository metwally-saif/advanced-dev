"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addReview, deleteReview, updateReview } from "@/lib/actions";
import { toDateString } from "@/lib/utils";

export function MovieReviewForm({
  movieId,
  slug,
  userLoggedIn = false,
  userHasReviewed = false,
}: {
  movieId: string;
  slug: string;
  userLoggedIn?: boolean;
  userHasReviewed?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userLoggedIn) {
      toast.error("Please sign in to review this movie");
      return;
    }

    if (userHasReviewed) {
      toast.error("You have already reviewed this movie");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("movieId", movieId);
      formData.append("content", content);
      formData.append("slug", slug);

      const result = await addReview(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Review submitted successfully");
        setContent("");
        // Force refresh to show the new review
        window.location.reload();
      }
    });
  };

  if (userHasReviewed) {
    return null; // Don't show form if user already reviewed
  }

  return (
    <form onSubmit={handleSubmit} className="mb-10 mt-6">
      <div className="mb-4">
        <label
          htmlFor="review"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Write your review
        </label>
        <textarea
          id="review"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!userLoggedIn || isPending}
          placeholder={
            userLoggedIn
              ? "Share your thoughts about this movie..."
              : "Sign in to write a review"
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          required
          minLength={10}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!userLoggedIn || isPending}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-r-2 border-t-2 border-white" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </form>
  );
}

export function ReviewItem({
  review,
  slug,
  currentUserId,
}: {
  review: any;
  slug: string;
  currentUserId?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(review.content);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.append("reviewId", review.id);
      formData.append("content", content);
      formData.append("slug", slug);

      const result = await updateReview(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Review updated successfully");
        setIsEditing(false);
        // Force refresh to show the updated review
        window.location.reload();
      }
    });
  };

  const handleDelete = () => {
    // eslint-disable-next-line no-alert
    if (confirm("Are you sure you want to delete this review?")) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("reviewId", review.id);
        formData.append("slug", slug);

        const result = await deleteReview(formData);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Review deleted successfully");
          // Force refresh to remove the deleted review
          window.location.reload();
        }
      });
    }
  };

  const isAuthor = currentUserId && review.user.id === currentUserId;

  return (
    <div className="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-3 flex items-center">
        <div className="flex-shrink-0">
          {review.user.image ? (
            <Image
              src={review.user.image}
              alt={review.user.name || "User"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
              <User size={20} className="text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {review.user.name || "Anonymous"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {toDateString(review.createdAt)}
            {review.updatedAt !== review.createdAt && " (edited)"}
          </p>
        </div>

        {isAuthor && (
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isPending}
              className="mr-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <textarea
            title="Review content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            rows={4}
            className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            required
            minLength={10}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {review.content}
        </div>
      )}
    </div>
  );
}

export function MovieReviewsList({
  reviews,
  slug,
  currentUserId,
}: {
  reviews: any[];
  slug: string;
  currentUserId?: string;
}) {
  if (reviews.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500 dark:text-gray-400">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          slug={slug}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
