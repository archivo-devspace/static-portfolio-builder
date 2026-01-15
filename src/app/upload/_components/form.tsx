"use client";

import { useState } from "react";

export default function Upload({ url }: { url: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(url);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const isZipFile = (file: File) => {
    return (
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed" ||
      file.name.toLowerCase().endsWith(".zip")
    );
  };

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

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!file) {
      setError("Please select a ZIP file before uploading.");
      setLoading(false);
      return;
    }

    if (!isZipFile(file)) {
      setError("Invalid file type. Only ZIP files are allowed.");
      setLoading(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 100MB limit.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { message } = await res.json();
      setMessage(message);

      // Force iframe reload to avoid caching
      const timestamp = Date.now();
      setPreviewUrl(`${url}?t=${timestamp}`);

      setFile(null);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row gap-8">
      {/* Left: Upload Form */}
      <div className="md:w-1/3 w-full p-6 flex flex-col gap-4 h-full">
        <form onSubmit={handleUpload} className="flex flex-col gap-4 flex-1">
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
      </div>

      {/* Right: Live Preview */}
      <div className="md:w-2/3 w-full flex flex-col gap-2 h-full">
        <h2 className="text-lg font-semibold text-gray-700">Live Preview</h2>

        {url && (
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            {/* URL Link */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {url}
            </a>

            {/* Copy Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                alert("URL copied to clipboard!");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white mx-5 px-3 py-1 rounded transition"
            >
              Copy
            </button>
          </div>
        )}
        <div className="w-full h-full border rounded overflow-hidden shadow-md flex">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              Uploading... Please wait
            </div>
          ) : previewUrl ? (
            <iframe
              key={previewUrl} // forces React to remount iframe
              src={previewUrl}
              className="w-full h-[90vh]"
              title="Deployment Preview"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              No preview available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
