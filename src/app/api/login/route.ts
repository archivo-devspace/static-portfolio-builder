import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import users from "@/data/users.json";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return NextResponse.json({ message: "Invalid login" }, { status: 401 });
  }

  const session = await getIronSession<{ username: string }>(
    await cookies(),
    sessionOptions
  );
  session.username = username;
  await session.save();

  return NextResponse.json({ success: true });
}
