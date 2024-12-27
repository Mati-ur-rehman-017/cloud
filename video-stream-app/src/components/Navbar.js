import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const { isSignedIn, user } = useUser(); // Clerk hook for user status and details

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section: Logo and User */}
          <div className="flex items-center space-x-8">
            {/* Netflix-style Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-red-600">
                Stream Time
              </Link>
            </div>
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-4">
              {isSignedIn && (
                <>
                  <Link
                    to="/user"
                    className="text-sm font-medium text-gray-300 hover:text-white transition"
                  >
                    User
                  </Link>
                  <Link
                    to="/stats"
                    className="text-sm font-medium text-gray-300 hover:text-white transition"
                  >
                    Stats
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Section: User Info */}
          <div className="flex items-center space-x-4">
            <UserButton />
            <span className="hidden md:block text-gray-400 text-sm">
              {user?.fullName || "Guest"}
            </span>
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black">
          {isSignedIn && (
            <>
              <Link
                to="/user"
                className="block py-2 px-4 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                User
              </Link>
              <Link
                to="/stats"
                className="block py-2 px-4 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Stats
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
