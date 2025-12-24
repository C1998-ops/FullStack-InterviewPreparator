import React, { useState, useEffect } from "react";

interface HamburgerMenuProps {
  onToggle?: (isOpen: boolean) => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize sidebar state based on screen size
    if (window.innerWidth > 768) {
      setIsOpen(true);
      onToggle?.(true);
    }
  }, [onToggle]);

  const handleClick = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
    
    // Toggle sidebar class
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.classList.toggle("open", newState);
    }
  };

  useEffect(() => {
    // Close sidebar when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector(".sidebar");
      const hamburger = document.querySelector(".hamburger");
      
      if (
        isOpen &&
        sidebar &&
        hamburger &&
        !sidebar.contains(e.target as Node) &&
        !hamburger.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onToggle?.(false);
        sidebar.classList.remove("open");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <button
      className={`hamburger ${isOpen ? "active" : ""}`}
      onClick={handleClick}
      aria-label="Toggle sidebar"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
};

export default HamburgerMenu;

