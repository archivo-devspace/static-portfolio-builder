import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import fs from "fs/promises";
import path from "path";

type User = {
  username: string;
  password: string; // plain text
};

// 🔹 Environment-aware base directory
const baseDir =
  process.env.NODE_ENV === "production"
    ? "/var/www/portfolios"
    : path.join(process.cwd(), "mock-portfolios-storage");

// 🔹 users.json path
const usersFilePath = path.join(baseDir, "data", "users.json");

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse payload
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400 }
      );
    }

    // 2️⃣ Read users.json at runtime
    const raw = await fs.readFile(usersFilePath, "utf-8");
    const users: User[] = JSON.parse(raw);

    // 3️⃣ Validate user (plain text)
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid login" },
        { status: 401 }
      );
    }

    // 4️⃣ Create session
    const session = await getIronSession<{ username: string }>(
      await cookies(),
      sessionOptions
    );

    session.username = user.username;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}
