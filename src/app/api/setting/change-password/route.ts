import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import fs from "fs/promises";
import path from "path";

type User = {
  username: string;
  password: string; // plain text (as requested)
};

// 🔹 Environment-aware base directory
const baseDir =
  process.env.NODE_ENV === "production"
    ? "/var/www/portfolios"
    : path.join(process.cwd(), "mock-portfolios-storage");

// 🔹 Users file path
const usersFilePath = path.join(baseDir, "data", "users.json");

export async function POST(req: Request) {
  try {
    // 1️⃣ Get session
    const session = await getIronSession<{ username: string }>(
      await cookies(),
      sessionOptions
    );

    if (!session.username) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Parse payload
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Missing password fields" },
        { status: 400 }
      );
    }

    // 3️⃣ Read users.json
    const raw = await fs.readFile(usersFilePath, "utf-8");
    const users: User[] = JSON.parse(raw);

    // 4️⃣ Locate user
    const index = users.findIndex(
      (u) => u.username === session.username
    );

    if (index === -1) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 5️⃣ Verify current password (plain text)
    if (users[index].password !== currentPassword) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // 6️⃣ Update password
    users[index].password = newPassword;

    // 7️⃣ Atomic save (safe for VPS)
    const tmpPath = usersFilePath + ".tmp";
    await fs.writeFile(tmpPath, JSON.stringify(users, null, 2), "utf-8");
    await fs.rename(tmpPath, usersFilePath);

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Failed to change password" },
      { status: 500 }
    );
  }
}
