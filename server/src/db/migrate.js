import "dotenv/config";                 // load .env (DATABASE_URL)
import pool from "../config/db.js";     // shared DB connection pool
import fs from "fs";                    // read folders/files
import path from "path";                // build file paths
import { fileURLToPath } from "url";    // URL -> normal path

// ES modules have no __dirname, so we build it
const __filename = fileURLToPath(import.meta.url);  // full path of this file
const __dirname = path.dirname(__filename);         // folder of this file
const migrationsFolder = path.join(__dirname, "migrations"); // .../db/migrations

async function migrate() {
  // 1. Register table: which files already ran
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations(
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // 2. All files in the folder, in order (001, 002, ...)
  // har file agaii
  const files = fs.readdirSync(migrationsFolder).sort();

  // 3. konsi files already recorded / already schema_migrations me hai?
  const result = await pool.query(`SELECT filename FROM schema_migrations`);

  // jo jo file schema_migrations me hai usko yaha save krdo inside applied
  const applied = new Set(result.rows.map((row) => row.filename));

  // 4. Loop over every file
  for (const file of files) {
    // continue means ky file hai to agly step py chalo loop close
    if (applied.has(file)) continue; // already ran -> skip

    // ye directory path or file name ko jorta hai or clean path milta hai or phirr ye utf8 us ko, ensures the contents are returned as a readable text string instead of a raw binary Buffer.
    const sql = fs.readFileSync(path.join(migrationsFolder, file), "utf8"); // read SQL text
    await pool.query(sql);       // run it
    // ab usko schema_migrations me dal do or $1 yani array me first
    await pool.query(
      "INSERT INTO schema_migrations (filename) VALUES ($1)",
      [file]                                                    // record it
    );

    console.log("applied", file);
  }

  console.log("migrations done");
  await pool.end(); // close the pool so the script exits
}

migrate();