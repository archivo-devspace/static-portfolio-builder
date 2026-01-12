import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import Upload from "./_components/form";

export default async function UploadPage() {
  const session = await getIronSession<{ username: string }>(
    await cookies(),
    sessionOptions
  );
  if (!session.username) redirect("/login");

  const host = process.env.HOST!;
  const folderName = `${session.username}.${host}`;
  const url = `https://${folderName}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Upload Portfolio for {session.username}
        </h1>
        <Upload username={session.username} url={url} />
      </div>
    </div>
  );
}
