import * as cron from "node-cron";
import * as tar from "tar";
import * as fs from "fs";
import * as path from "path";
import { log } from "./index";

const BACKUP_DIR = "/tmp/code-backups";
const SOURCE_DIRS = ["server", "client/src", "client/public", "shared"];
const EXCLUDE_PATTERNS = ["node_modules", ".git", "dist", "build", ".env", ".DS_Store"];

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function getAccessToken(): Promise<string> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found");
  }

  const response = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=google-drive",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  );

  const data = await response.json();
  const connectionSettings = data.items?.[0];
  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("Google Drive not connected");
  }

  return accessToken;
}

async function createCodeBackup(): Promise<string> {
  try {
    const timestamp = new Date().toISOString().split("T")[0];
    const backupFileName = `pos-code-backup-${timestamp}.tar.gz`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    // Create tar.gz archive
    await tar.create(
      {
        gzip: true,
        file: backupFilePath,
        cwd: process.cwd(),
        filter: (path: string) => {
          // Exclude node_modules, dist, build, etc
          for (const pattern of EXCLUDE_PATTERNS) {
            if (path.includes(pattern)) return false;
          }
          return true;
        },
      },
      SOURCE_DIRS
    );

    const stats = fs.statSync(backupFilePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    log(`✅ Code backup created: ${backupFileName} (${sizeInMB} MB)`, "code-backup");

    return backupFilePath;
  } catch (error) {
    throw new Error(`Failed to create code backup: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function uploadCodeBackupToGoogleDrive(backupFilePath: string): Promise<void> {
  try {
    const accessToken = await getAccessToken();
    const fileName = path.basename(backupFilePath);

    const fileBuffer = fs.readFileSync(backupFilePath);
    const form = new FormData();

    const metadata = {
      name: fileName,
      description: "Automatic POS application code backup",
      mimeType: "application/gzip",
    };

    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );

    form.append("file", new Blob([fileBuffer], { type: "application/gzip" }));

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload to Google Drive: ${error}`);
    }

    const result = await response.json();
    log(`✅ Code backup uploaded to Google Drive: ${fileName} (ID: ${result.id})`, "code-backup");

    // Clean up local backup file
    try {
      fs.unlinkSync(backupFilePath);
      log(`🧹 Local code backup cleaned up: ${fileName}`, "code-backup");
    } catch (e) {
      log(`⚠️ Failed to cleanup local backup: ${e}`, "code-backup");
    }
  } catch (error) {
    log(`❌ Code backup upload failed: ${error instanceof Error ? error.message : String(error)}`, "code-backup");
  }
}

export function initializeCodeBackupSchedule(): void {
  // Run code backup every day at 3 AM (after data backup at 2 AM)
  cron.schedule("0 3 * * *", async () => {
    try {
      const backupPath = await createCodeBackup();
      await uploadCodeBackupToGoogleDrive(backupPath);
    } catch (error) {
      log(`Code backup job failed: ${error instanceof Error ? error.message : String(error)}`, "code-backup");
    }
  });

  // Also run on startup (2 minutes after server starts)
  setTimeout(async () => {
    try {
      const backupPath = await createCodeBackup();
      await uploadCodeBackupToGoogleDrive(backupPath);
    } catch (error) {
      log(`Initial code backup failed: ${error instanceof Error ? error.message : String(error)}`, "code-backup");
    }
  }, 120000);

  log("✅ Code backup schedule initialized (daily at 3 AM)", "code-backup");
}
