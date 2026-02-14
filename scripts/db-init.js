const { openDb, exec, close } = require('../server/db');

async function main() {
  const db = openDb();

  try {
    await exec(
      db,
      `
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS owners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        whatsapp TEXT,
        email TEXT,
        note TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS codes (
        code TEXT PRIMARY KEY CHECK(length(code) = 12),
        owner_id INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY(owner_id) REFERENCES owners(id) ON DELETE CASCADE
      );
    `
    );

    console.log('Database initialized.');
  } finally {
    await close(db);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
