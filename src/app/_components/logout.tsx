"use client";

import { useRouter } from "next/navigation";

function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="border-blue-400 border-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
    >
      Logout
    </button>
  );
}

export default Logout;
