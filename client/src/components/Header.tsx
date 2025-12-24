import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const Header: React.FC<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo/Title Section */}
        <div className="hamburger-menu flex items-center md:mr-4 md:hidden">
          <button
            className="text-2xl sm:text-3xl cursor-pointer p-2 hover:bg-white hover:bg-opacity-10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? "✕" : "☰"}
          </button>
        </div>
        <div className="header-logo">
          <Link to="/" className="header-link">
            <div className="header-logo-content">
              <span className="header-icon">📚</span>
              <h1 className="header-title">JavaScript Interview Questions</h1>
            </div>
          </Link>
        </div>

        {/* User Section */}
        {user && (
          <div className="header-user-section" ref={menuRef}>
            <div
              className="header-user-profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img
                src={user.picture}
                alt={user.name || "User profile"}
                className="header-user-avatar"
              />
              <div className="header-user-info">
                <span className="header-user-name">{user.name}</span>
                {user.email && (
                  <span className="header-user-email">{user.email}</span>
                )}
              </div>
              <svg
                className={`header-dropdown-icon ${showUserMenu ? "open" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="header-user-menu">
                <div className="header-user-menu-item">
                  <div className="header-user-menu-header">
                    <img
                      src={user.picture}
                      alt={user.name || "User profile"}
                      className="header-user-menu-avatar"
                    />
                    <div>
                      <div className="header-user-menu-name">{user.name}</div>
                      {user.email && (
                        <div className="header-user-menu-email">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="header-user-menu-divider"></div>
                <button
                  onClick={handleLogout}
                  className="header-user-menu-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
