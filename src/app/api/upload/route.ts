import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { isSymlink } from "@/lib/file";

export const config = { api: { bodyParser: false } };

/* ---------------------------------
 * Security rules
 * --------------------------------- */
const ALLOWED_EXTENSIONS = [
  ".html",
  ".css",
  ".js",
  ".json",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
];

const BLOCKED_NAMES = [
  "node_modules",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
];

/* ---------------------------------
 * Limits
 * --------------------------------- */
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB ZIP
const MAX_EXTRACT_SIZE = 200 * 1024 * 1024; // 200MB extracted
const MAX_ZIP_ENTRIES = 1000;
const EXTRACT_TIMEOUT_MS = 30_000;

/* ---------------------------------
 * Utilities
 * --------------------------------- */
function isPathSafe(baseDir: string, targetPath: string) {
  const resolved = path.resolve(baseDir, targetPath);
  return resolved.startsWith(baseDir);
}

/* ---------------------------------
 * Flatten folders until index.html
 * --------------------------------- */
function flattenUntilIndex(rootDir: string) {
  const entries = fs.readdirSync(rootDir);

  if (entries.includes("index.html")) return;

  if (entries.length === 1) {
    const child = path.join(rootDir, entries[0]);
    if (fs.statSync(child).isDirectory()) {
      for (const entry of fs.readdirSync(child)) {
        fs.renameSync(path.join(child, entry), path.join(rootDir, entry));
      }
      fs.rmSync(child, { recursive: true, force: true });
      flattenUntilIndex(rootDir);
    }
  }
}

/* ---------------------------------
 * Safe ZIP extraction
 * --------------------------------- */
async function safeExtract(zipPath: string, targetDir: string) {
  const directory = await unzipper.Open.file(zipPath);

  if (directory.files.length > MAX_ZIP_ENTRIES) {
    throw new Error("ZIP contains too many files");
  }

  let totalExtractedSize = 0;

  for (const entry of directory.files) {
    const rawPath = entry.path;
    const normalizedPath = path.normalize(rawPath);
    const baseName = path.basename(normalizedPath);

    /* ---- Path traversal protection ---- */
    if (normalizedPath.startsWith("..") || path.isAbsolute(normalizedPath)) {
      throw new Error("Zip Slip detected");
    }

    /* ---- Symlink protection ---- */
    if (isSymlink(entry)) {
      throw new Error("Symbolic links are not allowed");
    }

    /* ---- Block hidden files ---- */
    if (baseName.startsWith(".")) {
      continue;
    }

    /* ---- Block known dangerous names ---- */
    if (BLOCKED_NAMES.includes(baseName)) {
      continue;
    }

    /* ---- Allow-list extensions ---- */
    if (
      entry.type === "File" &&
      !ALLOWED_EXTENSIONS.some((ext) => baseName.endsWith(ext))
    ) {
      continue;
    }

    const destPath = path.join(targetDir, normalizedPath);

    if (!isPathSafe(targetDir, destPath)) {
      throw new Error("Invalid extraction path");
    }

    if (entry.type === "Directory") {
      fs.mkdirSync(destPath, { recursive: true });
      continue;
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    await new Promise<void>((resolve, reject) => {
      const stream = entry.stream();
      const writeStream = fs.createWriteStream(destPath);
      let extractedBytes = 0;

      stream.on("data", (chunk) => {
        extractedBytes += chunk.length;
        totalExtractedSize += chunk.length;

        if (totalExtractedSize > MAX_EXTRACT_SIZE) {
          stream.destroy();
          reject(new Error("Extraction size limit exceeded"));
        }
      });

      stream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);

      stream.pipe(writeStream);
    });
  }
}

/* ---------------------------------
 * POST /api/upload
 * --------------------------------- */
export async function POST(req: Request) {
  try {
    /* ---- Authentication ---- */
    const session = await getIronSession<{ username: string }>(
      await cookies(),
      sessionOptions
    );

    if (!session.username) {
      return new Response("Unauthorized", { status: 401 });
    }

    /* ---- File input ---- */
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_FILE_SIZE) {
      return new Response("ZIP file too large", { status: 400 });
    }

    /* ---- Target directory ---- */
    const host = process.env.HOST!;
    const folderName = `${session.username}.${host}`;
    const baseDir =
      process.env.NODE_ENV === "production"
        ? "/var/www/portfolios"
        : path.join(process.cwd(), "mock-portfolios-storage");

    const targetDir = path.join(baseDir, folderName);

    fs.mkdirSync(targetDir, { recursive: true });

    for (const entry of fs.readdirSync(targetDir)) {
      fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
    }

    /* ---- Save ZIP ---- */
    const zipPath = path.join(targetDir, `upload-${Date.now()}.zip`);
    fs.writeFileSync(zipPath, buffer);

    /* ---- Extract with timeout ---- */
    await Promise.race([
      safeExtract(zipPath, targetDir),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Extraction timeout")),
          EXTRACT_TIMEOUT_MS
        )
      ),
    ]);

    fs.unlinkSync(zipPath);

    /* ---- Flatten ---- */
    flattenUntilIndex(targetDir);

    /* ---- Validate ---- */
    if (!fs.existsSync(path.join(targetDir, "index.html"))) {
      throw new Error("index.html not found");
    }

    return Response.json({
      message: "Deployed successfully",
      url: `https://${folderName}`,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(`Deployment failed: ${err.message}`, { status: 500 });
  }
}
