"use client";

import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const isZipFile = (file: File) => {
    return (
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed" ||
      file.name.toLowerCase().endsWith(".zip")
    );
  };

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Please select a ZIP file before uploading.");
      return;
    }

    if (!isZipFile(file)) {
      setError("Invalid file type. Only ZIP files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 100MB limit.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const text = await res.text();
      setMessage(text);
      setFile(null);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!isZipFile(selectedFile)) {
      setFile(null);
      setError("Invalid file type. Please select a ZIP file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("File size exceeds 100MB limit.");
      return;
    }

    setFile(selectedFile);
  }

  return (
    <form
      onSubmit={handleUpload}
      className="max-w-md mx-auto flex flex-col gap-4 bg-white p-6 rounded-lg shadow"
    >
      <label className="text-gray-700 font-medium">
        Select ZIP file <span className="text-red-500">*</span>
      </label>

      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className={`block w-full rounded px-3 py-2 border focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || !file}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Uploading..." : "Deploy"}
      </button>

      {message && (
        <p className="text-center text-green-600 font-medium">{message}</p>
      )}
    </form>
  );
}
