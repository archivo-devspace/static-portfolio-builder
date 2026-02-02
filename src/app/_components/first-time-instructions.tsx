"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "spb-instructions-seen-v1";

export default function FirstTimeInstructions() {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) setIsOpen(true);
    setIsReady(true);
  }, []);

  const handleClose = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (!isReady || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-time-instructions-title"
    >
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="first-time-instructions-title"
            className="text-xl font-bold text-gray-800"
          >
            Welcome to Static Portfolio Builder
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close instructions"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <p className="mt-3 text-gray-600">
          This app lets you upload a ZIP file of a static website and instantly
          deploy it with a live preview.
        </p>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800">How to use</h3>
          <ol className="mt-2 list-decimal pl-5 text-gray-600 space-y-1">
            <li>Sign in, then open the Upload page.</li>
            <li>Select your ZIP file and click Deploy.</li>
            <li>Use the live preview link to view your site.</li>
            <li>Re-upload anytime to update the deployment.</li>
          </ol>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
