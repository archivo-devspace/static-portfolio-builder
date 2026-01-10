"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logout from "./logout";

export default function Navbar() {
  const path = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch session from API
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        setUsername(data.username || null);
      } catch (err) {
        console.error(err);
        setUsername(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [path]);

  if (loading) return null;

  // Define menus
  const desktopMenu: any[] = [];

  if (username) {
    desktopMenu.push(
      { type: "link", name: "Upload", href: "/upload" },
      { type: "username", name: username },
      { type: "component", component: <Logout key="logout" /> }
    );
  }

  const mobileMenu = desktopMenu;

  // Render function
  const renderItem = (item: any, idx: number) => {
    if (item.type === "link") {
      return (
        <Link
          key={idx}
          href={item.href}
          className="text-blue-700 hover:text-blue-900 px-3 py-2 rounded-md transition-colors hover:bg-gray-100"
        >
          {item.name}
        </Link>
      );
    } else if (item.type === "username") {
      return (
        <span
          key={idx}
          className="text-gray-500 font-semibold px-3 py-2"
        >
          Hello, {item.name}
        </span>
      );
    } else if (item.type === "component") {
      return item.component;
    }
  };

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
          <div className="hidden md:flex items-center gap-2">
            {desktopMenu.map(renderItem)}
          </div>

          {/* Mobile Menu Button */}
          {mobileMenu.length > 0 && (
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
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-inner border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 flex flex-col gap-1">
            {mobileMenu.map(renderItem)}
          </div>
        </div>
      )}
    </nav>
  );
}
