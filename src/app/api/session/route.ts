import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function GET() {
  const session = await getIronSession<{username: string}>(await cookies(), sessionOptions);
  return Response.json({ username: session.username || null });
}
