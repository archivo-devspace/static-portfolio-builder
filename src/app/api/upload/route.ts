import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";

export const config = { api: { bodyParser: false } };

/**
 * Recursively flatten folder until index.html is found
 */
function flattenUntilIndex(rootDir: string) {
  const entries = fs.readdirSync(rootDir);

  // Stop if index.html exists at this level
  if (entries.includes("index.html")) return;

  // If only one folder exists, flatten it
  if (entries.length === 1) {
    const singlePath = path.join(rootDir, entries[0]);
    if (fs.statSync(singlePath).isDirectory()) {
      const innerEntries = fs.readdirSync(singlePath);

      // Move all contents up
      for (const entry of innerEntries) {
        fs.renameSync(
          path.join(singlePath, entry),
          path.join(rootDir, entry)
        );
      }

      fs.rmSync(singlePath, { recursive: true, force: true });

      // Recurse in case index.html is still nested
      flattenUntilIndex(rootDir);
    }
  }
}

export async function POST(req: Request) {
  // 1. Auth
  const session = await getIronSession<{ username: string }>(
    await cookies(),
    sessionOptions
  );

  if (!session.username) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Get file
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response("No file uploaded", { status: 400 });
  }

  // 3. Resolve target directory
  const host = process.env.HOST!;
  const folderName = `${session.username}.${host}`;

  const targetDir =
    process.env.NODE_ENV !== "production"
      ? path.join(process.cwd(), "mock-portfolios-storage", folderName)
      : `/var/www/portfolios/${folderName}`;

  try {
    // 4. Prepare directories
    fs.mkdirSync(targetDir, { recursive: true });

    // Remove old deployment
    for (const entry of fs.readdirSync(targetDir)) {
      fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
    }

    // 5. Save ZIP temporarily directly in targetDir
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempZipPath = path.join(targetDir, `${Date.now()}-${file.name}`);
    fs.writeFileSync(tempZipPath, buffer);

    // 6. Extract ZIP into targetDir
    await fs.createReadStream(tempZipPath)
      .pipe(unzipper.Extract({ path: targetDir }))
      .promise();

    // Remove temp ZIP file
    fs.unlinkSync(tempZipPath);

    // 7. Flatten folders until index.html is at root
    flattenUntilIndex(targetDir);

    // 8. Validate deployment
    const indexPath = path.join(targetDir, "index.html");
    if (!fs.existsSync(indexPath)) {
      throw new Error("index.html not found after deployment");
    }

    // 9. Return live URL
    const url = `https://${folderName}`;

    return Response.json({ message: "Deployed successfully", url });
  } catch (err: any) {
    console.error(err);
    return new Response(`Deployment failed: ${err.message}`, { status: 500 });
  }
}
