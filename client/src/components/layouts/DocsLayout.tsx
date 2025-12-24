import React, { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header";
import { Sidebar } from "../SidePanel";

const DocsLayout: React.FC = () => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      // On desktop (md and up), keep sidebar open by default
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        // On mobile, close sidebar when resizing to mobile
        setIsSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    const handleScrollPosition = () => {
      // Find the scrollable content element
      const contentElement = mainContentRef.current?.querySelector(
        ".content"
      ) as HTMLElement;

      if (contentElement) {
        const scrollTop = contentElement.scrollTop;

        // Show button when scrolled down more than 300px
        const scrollThreshold = 300;

        if (scrollTop > scrollThreshold) {
          setShowScrollToTop(true);
        } else {
          setShowScrollToTop(false);
        }
      }
    };

    // Small delay to ensure content element is rendered
    const timeoutId = setTimeout(() => {
      const contentElement = mainContentRef.current?.querySelector(
        ".content"
      ) as HTMLElement;

      if (contentElement) {
        contentElement.addEventListener("scroll", handleScrollPosition);
        // Check initial scroll position
        handleScrollPosition();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const contentElement = mainContentRef.current?.querySelector(
        ".content"
      ) as HTMLElement;
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScrollPosition);
      }
    };
  }, []);

  const scrollToTop = () => {
    const contentElement = mainContentRef.current?.querySelector(
      ".content"
    ) as HTMLElement;
    if (contentElement) {
      contentElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - full width */}
      <div className="w-full z-50 relative">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* Backdrop overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area with sidebar and outlet side-by-side */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - full width on mobile (overlay), fixed width on desktop */}
        <aside
          className={`
            fixed md:relative
            top-0 left-0
            w-full md:w-[300px]
            h-screen md:h-auto
            flex shrink-0
            flex-col overflow-hidden
            bg-white
            z-50 md:z-auto
            transform transition-transform duration-300 ease-in-out
            ${
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }
            shadow-lg md:shadow-none
            border-r border-gray-200
          `}
          style={{ maxHeight: "100vh" }}
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </aside>

        {/* Main content - flexible width, right side */}
        <main
          ref={mainContentRef}
          className="flex-1 flex flex-col overflow-hidden relative w-full"
        >
          <Outlet />
          {showScrollToTop && (
            <button
              className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-30 bg-gray-200 hover:bg-gray-300 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          )}
        </main>
      </div>
    </div>
  );
};
export default DocsLayout;
