"use client";

import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { useEffect, useRef, useState } from "react";
import { Tweet } from "react-tweet";

import BlurImage from "@/components/blur-image";
import { replaceLinks } from "@/lib/remark-plugins";

export default function MDX({ source }: { source: MDXRemoteProps }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [maxHeight, _setMaxHeight] = useState<string>("400px"); // Slightly shorter for better truncation

  const components = {
    a: replaceLinks,
    BlurImage,
    Tweet,
  };

  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const fullHeight = contentRef.current.scrollHeight;
        const visibleHeight = parseInt(maxHeight);
        setIsTruncated(fullHeight > visibleHeight);
      }
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, [maxHeight, source]);

  return (
    <div
      className={`container mx-auto px-24 transition-all duration-500 ease-in-out`}
    >
      <article
        className={`prose prose-base prose-stone max-w-none dark:prose-invert`}
        suppressHydrationWarning={true}
      >
        <div
          ref={contentRef}
          className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "" : "relative"}`}
          style={{ maxHeight: isExpanded ? "100%" : maxHeight }}
        >
          {/* @ts-ignore */}
          <MDXRemote {...source} components={components} />

          {!isExpanded && isTruncated && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-black" />
          )}
        </div>

        {isTruncated && (
          <div className="mb-8 mt-4 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
