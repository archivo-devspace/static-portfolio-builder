import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  // Get session
  const session = await getIronSession<{ username: string }>(
    await cookies(),
    sessionOptions
  );
  const username = session.username;
  if (!username) return new Response("Unauthorized", { status: 401 });

  // Parse formData
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return new Response("No file uploaded", { status: 400 });

  try {
    // 🔹 Use dynamic folder: server vs local
    const isLocal = process.env.NODE_ENV !== "production";
    const folderName = `${username}.${process.env.DOMAIN}`;
    const targetDir = isLocal
      ? path.join(process.cwd(), "mock-portfolios-storage", folderName)
      : `/var/www/portfolios/${folderName}`;

    // Remove old content
    fs.readdirSync(targetDir).forEach(f =>
      fs.rmSync(path.join(targetDir, f), { recursive: true, force: true })
    );

    // Save ZIP temporarily
    const arrayBuffer = await file.arrayBuffer();
    const tempPath = path.join(isLocal ? "./tmp" : "/tmp", file.name);
    if (!fs.existsSync(path.dirname(tempPath))) fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));

    // Extract ZIP
    await fs.createReadStream(tempPath)
      .pipe(unzipper.Extract({ path: targetDir }))
      .promise();

    // Remove temp file
    fs.unlinkSync(tempPath);

    return new Response("Deployed successfully");
  } catch (err: any) {
    console.error(err);
    return new Response("Deployment failed: " + err.message, { status: 500 });
  }
}
