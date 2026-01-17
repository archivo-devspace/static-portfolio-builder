"use client";

import { useState } from "react";

export default function SettingPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/setting/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(`❌ ${data.message || "Failed to change password"}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-25 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>

      {message && (
        <p className={`mb-4 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
