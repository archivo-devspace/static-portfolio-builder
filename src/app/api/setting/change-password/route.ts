import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import fs from "fs/promises";
import path from "path";

type User = {
  username: string;
  password: string; // plain text password
};

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

    // 2️⃣ Get payload
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Missing password fields" },
        { status: 400 }
      );
    }

    // 3️⃣ Load users.json
    const usersFilePath = path.join(process.cwd(), "data", "users.json");
    const raw = await fs.readFile(usersFilePath, "utf-8");
    const users: User[] = JSON.parse(raw);

    // 4️⃣ Find current user
    const userIndex = users.findIndex(u => u.username === session.username);
    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[userIndex];

    // 5️⃣ Verify current password (plain text)
    if (user.password !== currentPassword) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // 6️⃣ Update password
    users[userIndex].password = newPassword;

    // 7️⃣ Save updated users.json
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to change password" },
      { status: 500 }
    );
  }
}
