"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

// Letter size at 96dpi: 816×1056px
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 48;
const MARGIN_LEFT = 40;
const MARGIN_RIGHT = 40;
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM; // 960px

const MAX_PAGES = 2;

interface PageLayoutProps {
  /** Each child element is treated as a "section" that won't be split across pages. */
  children: ReactNode;
  /** Name shown in page 2 header */
  name?: string;
}

/**
 * Renders children into letter-sized pages (8.5×11 at 96dpi).
 * Sections are never split across pages — if a section doesn't fit
 * in the remaining content area, it starts on the next page.
 * Page 2 includes a header with the user's name. Footer shows page number.
 * Max 2 pages.
 */
export function PageLayout({ children, name }: PageLayoutProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([]);
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    if (!measureRef.current) return;

    const sections = Array.from(measureRef.current.children) as HTMLElement[];
    const result: number[][] = [[]];
    let currentPage = 0;
    let usedHeight = 0;

    for (let i = 0; i < sections.length; i++) {
      const sectionHeight = sections[i].offsetHeight;

      // Page 2 header takes ~32px, account for that
      const pageContentHeight =
        currentPage === 0 ? CONTENT_HEIGHT : CONTENT_HEIGHT - 32;

      if (usedHeight + sectionHeight > pageContentHeight && usedHeight > 0) {
        // Move to next page
        currentPage++;
        if (currentPage >= MAX_PAGES) break; // Max 2 pages
        result.push([]);
        usedHeight = 0;
      }

      result[currentPage].push(i);
      usedHeight += sectionHeight;
    }

    setPages(result);
    setMeasured(true);
  }, [children]);

  // Convert children to array for index-based access
  const childArray: ReactNode[] = [];
  const flattenChildren = (node: ReactNode) => {
    if (Array.isArray(node)) {
      node.forEach(flattenChildren);
    } else if (node != null && node !== false && node !== true) {
      childArray.push(node);
    }
  };
  flattenChildren(children);

  return (
    <>
      {/* Hidden measurement container — same width/margins as real pages */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none fixed left-[-9999px] top-0"
        style={{
          width: PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
          fontSize: "10px",
          lineHeight: "1.4",
        }}
      >
        {childArray.map((child, i) => (
          <div key={i}>{child}</div>
        ))}
      </div>

      {/* Rendered pages */}
      {measured && (
        <div className="flex flex-col items-center gap-6">
          {pages.map((sectionIndices, pageIndex) => (
            <div
              key={pageIndex}
              className="relative bg-white text-black shadow-md"
              style={{
                width: PAGE_WIDTH,
                minHeight: PAGE_HEIGHT,
                maxHeight: PAGE_HEIGHT,
                overflow: "hidden",
                fontSize: "10px",
                lineHeight: "1.4",
              }}
            >
              {/* Page content area */}
              <div
                style={{
                  paddingTop: MARGIN_TOP,
                  paddingBottom: MARGIN_BOTTOM,
                  paddingLeft: MARGIN_LEFT,
                  paddingRight: MARGIN_RIGHT,
                }}
              >
                {/* Page 2+ header with name */}
                {pageIndex > 0 && name && (
                  <div className="mb-4 border-b border-gray-300 pb-2 text-xs font-semibold text-gray-600">
                    {name}
                  </div>
                )}

                {sectionIndices.map((sectionIndex) => (
                  <div key={sectionIndex}>{childArray[sectionIndex]}</div>
                ))}
              </div>

              {/* Footer with page number */}
              <div
                className="absolute inset-x-0 bottom-0 text-center text-[9px] text-gray-400"
                style={{ paddingBottom: 16 }}
              >
                {pageIndex + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
