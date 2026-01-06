"use client";

import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const text = await res.text();
      setMessage(text);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4">
      <label className="block text-gray-700 font-medium">
        Select ZIP file:
      </label>
      <input
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-gray-700 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Deploy"}
      </button>

      {message && <p className="text-center text-gray-700 mt-2">{message}</p>}
    </form>
  );
}
