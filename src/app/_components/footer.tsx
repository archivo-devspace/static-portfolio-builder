"use client";

export default function Footer() {
  return (
    <footer className="text-gray-700 mt-8 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-center items-center gap-4">
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Portal. All rights reserved by{" "}
          <a
            href={process.env.DOMAIN ?? "https://archivodevspace.com"}
            className="underline text-blue-600"
            target="_blank"
          >
            Archivo DevSpace
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
