"use client";

import { useState } from "react";
import Link from "next/link";
import Logout from "../logout";

interface NavbarProps {
  username: string;
}

export default function NavbarClient({ username }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link
              href="/"
              className="text-blue-600 font-bold text-xl hover:text-blue-800 transition-colors"
            >
              Portal
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/upload"
              className=" text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors hover:bg-gray-100"
            >
              Upload
            </Link>
            <span className="text-gray-300 font-medium">Hello, {username}</span>
            <Logout />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition"
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-inner border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 flex flex-col gap-1">
            <Link
              href="/upload"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
              onClick={() => setIsOpen(false)}
            >
              Upload
            </Link>
            <span className="px-3 py-2 text-gray-300 font-medium">Hello, {username}</span>
            <div className="px-3 py-2">
              <Logout />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
