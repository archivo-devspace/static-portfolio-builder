import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";

export const config = { api: { bodyParser: false } };

/* -----------------------------
 * Security rules
 * --------------------------- */
const BLOCKED_EXTENSIONS = [
  ".exe", ".sh", ".bat", ".ps1", ".php",
];

const BLOCKED_NAMES = [
  ".env", ".git", ".gitignore", "node_modules",
  "package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
];

/* -----------------------------
 * Limits
 * --------------------------- */
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB uploaded ZIP
const MAX_EXTRACT_SIZE = 200 * 1024 * 1024; // 200MB uncompressed total
const MAX_ZIP_ENTRIES = 1000; // max number of files/folders inside ZIP

/* -----------------------------
 * Flatten folders until index.html
 * --------------------------- */
function flattenUntilIndex(rootDir: string) {
  const entries = fs.readdirSync(rootDir);

  if (entries.includes("index.html")) return;

  if (entries.length === 1) {
    const child = path.join(rootDir, entries[0]);
    if (fs.statSync(child).isDirectory()) {
      for (const entry of fs.readdirSync(child)) {
        fs.renameSync(
          path.join(child, entry),
          path.join(rootDir, entry)
        );
      }
      fs.rmSync(child, { recursive: true, force: true });
      flattenUntilIndex(rootDir);
    }
  }
}

/* -----------------------------
 * Safe ZIP extraction with total size check
 * --------------------------- */
async function safeExtract(zipPath: string, targetDir: string) {
  const directory = await unzipper.Open.file(zipPath);

  if (directory.files.length > MAX_ZIP_ENTRIES) {
    throw new Error(`ZIP contains too many entries (max ${MAX_ZIP_ENTRIES})`);
  }

  let totalExtractedSize = 0;

  for (const entry of directory.files) {
    const entryPath = entry.path;

    // Prevent Zip Slip
    if (entryPath.includes("..")) {
      throw new Error("Zip Slip detected");
    }

    const baseName = path.basename(entryPath);

    if (
      BLOCKED_NAMES.includes(baseName) ||
      BLOCKED_EXTENSIONS.some(ext => baseName.endsWith(ext))
    ) {
      continue; // skip blocked files
    }

    const destPath = path.join(targetDir, entryPath);

    if (entry.type === "Directory") {
      fs.mkdirSync(destPath, { recursive: true });
    } else {
      // Stream extraction & size check
      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      await new Promise<void>((res, rej) => {
        let extractedBytes = 0;
        entry.stream()
          .on("data", chunk => {
            extractedBytes += chunk.length;
            totalExtractedSize += chunk.length;
            if (totalExtractedSize > MAX_EXTRACT_SIZE) {
              rej(new Error(`Extraction exceeded maximum allowed size of ${MAX_EXTRACT_SIZE / (1024 * 1024)}MB`));
            }
          })
          .pipe(fs.createWriteStream(destPath))
          .on("finish", res)
          .on("error", rej);
      });
    }
  }
}

/* -----------------------------
 * POST /api/upload
 * --------------------------- */
export async function POST(req: Request) {
  try {
    // 1. Auth
    const session = await getIronSession<{ username: string }>(
      await cookies(),
      sessionOptions
    );
    if (!session.username) return new Response("Unauthorized", { status: 401 });

    // 2. File
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return new Response("No file uploaded", { status: 400 });

    // 3. Check ZIP file size
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE) {
      return new Response(
        `ZIP file too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        { status: 400 }
      );
    }

    // 4. Target directory
    const isLocal = process.env.NODE_ENV !== "production";
    const host = process.env.HOST!;
    const folderName = `${session.username}.${host}`;
    const targetDir = isLocal
      ? path.join(process.cwd(), "mock-portfolios-storage", folderName)
      : `/var/www/portfolios/${folderName}`;

    fs.mkdirSync(targetDir, { recursive: true });

    // Remove old deployment
    for (const entry of fs.readdirSync(targetDir)) {
      fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
    }

    // 5. Save ZIP temporarily inside targetDir
    const zipPath = path.join(targetDir, `${Date.now()}-${file.name}`);
    fs.writeFileSync(zipPath, buffer);

    // 6. Extract safely with size limit
    await safeExtract(zipPath, targetDir);

    fs.unlinkSync(zipPath);

    // 7. Flatten folders until index.html
    flattenUntilIndex(targetDir);

    // 8. Validate deployment
    if (!fs.existsSync(path.join(targetDir, "index.html"))) {
      throw new Error("index.html not found after deployment");
    }

    // 9. Return URL
    const url = `https://${folderName}`;
    return Response.json({ message: "Deployed successfully", url });
  } catch (err: any) {
    console.error(err);
    return new Response(`Deployment failed: ${err.message}`, { status: 500 });
  }
}
