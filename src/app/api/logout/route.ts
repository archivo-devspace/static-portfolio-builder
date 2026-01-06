import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST() {
  const session = await getIronSession(await cookies(), sessionOptions);
  session.destroy();
  return Response.json({ success: true });
}
