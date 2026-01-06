import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import NavbarClient from "./navbar-client";
import { redirect } from "next/navigation";

export default async function Navbar() {
  // get session on server
  const session = await getIronSession<{ username: string }>(
    await cookies(),
    sessionOptions
  );

  if (!session.username) redirect("/login");

  return <NavbarClient username={session.username} />;
}
