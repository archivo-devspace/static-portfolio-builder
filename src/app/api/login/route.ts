import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import fs from "fs/promises";
import path from "path";

type User = {
  username: string;
  password: string;
};

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // 🔥 Read users.json at runtime
  const usersFilePath = path.join(process.cwd(), "data", "users.json");
  const raw = await fs.readFile(usersFilePath, "utf-8");
  const users: User[] = JSON.parse(raw);

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return NextResponse.json(
      { message: "Invalid login" },
      { status: 401 }
    );
  }

  const session = await getIronSession<{ username: string }>(
    await cookies(),
    sessionOptions
  );

  session.username = username;
  await session.save();

  return NextResponse.json({ success: true });
}
