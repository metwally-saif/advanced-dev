"use client";

import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { replaceLinks } from "@/lib/remark-plugins";
import { Tweet } from "react-tweet";
import BlurImage from "@/components/blur-image";
import { useState, useRef, useEffect } from "react";

export default function MDX({ source }: { source: MDXRemoteProps }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>("400px"); // Slightly shorter for better truncation

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
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, [maxHeight, source]);

  return (
    <div className={`transition-all duration-500 ease-in-out container mx-auto px-24`}>
      <article
        className={`prose prose-stone max-w-none prose-base dark:prose-invert`}
        suppressHydrationWarning={true}
      >
        <div
          ref={contentRef}
          className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? '' : 'relative'}`}
          style={{ maxHeight: isExpanded ? '100%' : maxHeight }}
        >
          {/* @ts-ignore */}
          <MDXRemote {...source} components={components} />

          {!isExpanded && isTruncated && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-black to-transparent"></div>
          )}
        </div>

        {isTruncated && (
          <div className="flex justify-center mt-4 mb-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
