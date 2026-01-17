import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import PasswordSetting from "./_components/password-setting";

export default async function UploadPage() {
  const session = await getIronSession<{ username: string }>(
    await cookies(),
    sessionOptions
  );
  if (!session.username) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full mt-15 py-5">
        <PasswordSetting />
      </div>
    </div>
  );
}
