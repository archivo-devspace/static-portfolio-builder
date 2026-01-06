import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getIronSession<{ username: string }>(
    await cookies(),
    sessionOptions
  );

  if (!session.username) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex flex-col items-center justify-center mt-20 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Welcome, {session.username}!
          </h1>

          <div className="flex flex-col gap-4">
            <Link
              href="/upload"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors"
            >
              Upload ZIP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
