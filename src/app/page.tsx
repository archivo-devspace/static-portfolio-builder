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
    <div>
      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Welcome, {session.username}!
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            This is your dashboard for deploying your static portfolio. Use the
            upload flow to publish a ZIP and get a live preview link.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            How to use: click Upload ZIP, choose your website ZIP (with an
            `index.html`), then deploy. Re-upload anytime to update your site.
          </p>

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
