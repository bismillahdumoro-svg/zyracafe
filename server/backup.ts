import * as cron from "node-cron";
import { db } from "./db";
import * as schema from "@shared/schema";
import { log } from "./index";

interface BackupData {
  timestamp: string;
  users: any[];
  categories: any[];
  products: any[];
  shifts: any[];
  transactions: any[];
  transactionItems: any[];
  stockAdjustments: any[];
  expenses: any[];
  loans: any[];
  billiardRentals: any[];
  billiardTables: any[];
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

async function createBackup(): Promise<BackupData> {
  log("Creating database backup...", "backup");

  const [users, categories, products, shifts, transactions, transactionItems, stockAdjustments, expenses, loans, billiardRentals, billiardTables] =
    await Promise.all([
      db.select().from(schema.users),
      db.select().from(schema.categories),
      db.select().from(schema.products),
      db.select().from(schema.shifts),
      db.select().from(schema.transactions),
      db.select().from(schema.transactionItems),
      db.select().from(schema.stockAdjustments),
      db.select().from(schema.expenses),
      db.select().from(schema.loans),
      db.select().from(schema.billiardRentals),
      db.select().from(schema.billiardTables),
    ]);

  return {
    timestamp: new Date().toISOString(),
    users,
    categories,
    products,
    shifts,
    transactions,
    transactionItems,
    stockAdjustments,
    expenses,
    loans,
    billiardRentals,
    billiardTables,
  };
}

async function uploadToGoogleDrive(backupData: BackupData): Promise<void> {
  try {
    const accessToken = await getAccessToken();

    const backupContent = JSON.stringify(backupData, null, 2);
    const fileName = `pos-backup-${new Date().toISOString().split("T")[0]}.json`;

    const metadata = {
      name: fileName,
      mimeType: "application/json",
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append(
      "file",
      new Blob([backupContent], { type: "application/json" })
    );

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
    log(`✅ Backup uploaded to Google Drive: ${fileName} (ID: ${result.id})`, "backup");
  } catch (error) {
    log(`❌ Backup upload failed: ${error instanceof Error ? error.message : String(error)}`, "backup");
  }
}

export function initializeBackupSchedule(): void {
  // Run backup every day at 2 AM
  cron.schedule("0 2 * * *", async () => {
    try {
      const backupData = await createBackup();
      await uploadToGoogleDrive(backupData);
    } catch (error) {
      log(`Backup job failed: ${error instanceof Error ? error.message : String(error)}`, "backup");
    }
  });

  // Also run on startup (1 minute after server starts)
  setTimeout(async () => {
    try {
      const backupData = await createBackup();
      await uploadToGoogleDrive(backupData);
    } catch (error) {
      log(`Initial backup failed: ${error instanceof Error ? error.message : String(error)}`, "backup");
    }
  }, 60000);

  log("✅ Database backup schedule initialized (daily at 2 AM)", "backup");
}
