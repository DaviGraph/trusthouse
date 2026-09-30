import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const supabaseUrl = process.env.DATABASE_URL;
const neonUrl = "postgresql://neondb_owner:npg_AQon87fbBJxY@ep-sparkling-king-zaeu45mx-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!supabaseUrl) {
  console.error("DATABASE_URL (Supabase source) is not set!");
  process.exit(1);
}

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(rootDir, "migrations");

async function main() {
  console.log("Starting migration from Supabase to Neon...");
  console.log("Source (Supabase):", supabaseUrl.replace(/:[^:@]+@/, ":***@"));
  console.log("Destination (Neon):", neonUrl.replace(/:[^:@]+@/, ":***@"));

  const srcPool = new pg.Pool({ connectionString: supabaseUrl, ssl: { rejectUnauthorized: false } });
  const dstPool = new pg.Pool({ connectionString: neonUrl });

  const srcClient = await srcPool.connect();
  const dstClient = await dstPool.connect();

  try {
    console.log("\n--- Step 1: Applying Schema to Neon ---");
    // Ensure _migrations table exists
    await dstClient.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Read and apply migration files to Neon
    const migrationFiles = [
      "0001_auth.sql",
      "0002_trusthouse.sql",
      "0003_listings_photos_videos_onsite.sql",
    ];

    for (const file of migrationFiles) {
      console.log(`Executing migration file ${file} on Neon...`);
      const sqlText = await readFile(join(migrationsDir, file), "utf8");
      await dstClient.query(sqlText);
      await dstClient.query(
        "INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [file]
      );
    }
    console.log("Schema applied successfully on Neon.");

    console.log("\n--- Step 2: Preparing Tables for Clean 1:1 Copy ---");
    // Truncate tables on Neon in reverse FK dependency order so we can insert exact rows from Supabase
    await dstClient.query(`
      TRUNCATE TABLE inquiries, listings, agents, verification, session, account, "user", _migrations RESTART IDENTITY CASCADE
    `);
    console.log("Destination tables truncated cleanly.");

    console.log("\n--- Step 3: Copying Data from Supabase to Neon ---");
    const tablesInOrder = [
      "_migrations",
      "user",
      "account",
      "session",
      "verification",
      "agents",
      "listings",
      "inquiries",
    ];

    for (const tableName of tablesInOrder) {
      const quotedTable = `"${tableName}"`;
      // Fetch all columns and data from source
      const srcRowsRes = await srcClient.query(`SELECT * FROM ${quotedTable}`);
      const rows = srcRowsRes.rows;
      console.log(`Table ${tableName}: copying ${rows.length} rows...`);

      if (rows.length === 0) continue;

      // Get column names from the first row
      const columns = Object.keys(rows[0]);
      const quotedCols = columns.map((c) => `"${c}"`).join(", ");

      for (const row of rows) {
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
        const values = columns.map((col) => row[col]);
        const insertQuery = `INSERT INTO ${quotedTable} (${quotedCols}) VALUES (${placeholders})`;
        await dstClient.query(insertQuery, values);
      }
      console.log(`  -> Inserted ${rows.length} rows into ${tableName}.`);
    }

    console.log("\n--- Step 4: Updating Sequences ---");
    const seqUpdates = [
      { table: "listings", seq: "listings_id_seq" },
      { table: "inquiries", seq: "inquiries_id_seq" },
    ];

    for (const { table, seq } of seqUpdates) {
      const maxRes = await dstClient.query(`SELECT coalesce(max(id), 1) as max_id FROM "${table}"`);
      const maxId = Number(maxRes.rows[0].max_id);
      await dstClient.query(`SELECT setval('${seq}', $1, true)`, [maxId]);
      console.log(`Sequence ${seq} set to ${maxId}.`);
    }

    console.log("\n--- Step 5: Verification & Validation ---");
    let allMatched = true;
    for (const tableName of tablesInOrder) {
      const quotedTable = `"${tableName}"`;
      const srcCount = (await srcClient.query(`SELECT count(*) FROM ${quotedTable}`)).rows[0].count;
      const dstCount = (await dstClient.query(`SELECT count(*) FROM ${quotedTable}`)).rows[0].count;

      const match = String(srcCount) === String(dstCount);
      console.log(`Table ${tableName}: Source=${srcCount} | Destination=${dstCount} | Status: ${match ? "OK" : "MISMATCH"}`);
      if (!match) allMatched = false;
    }

    if (!allMatched) {
      throw new Error("Row count validation failed!");
    }

    console.log("\nMigration completed successfully! All tables and data verified.");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    srcClient.release();
    dstClient.release();
    await srcPool.end();
    await dstPool.end();
  }
}

main();
