const { openDb, exec, run, get, close } = require('../server/db');

const SAMPLE_SLUG = 'budi-santoso';
const SAMPLE_CODE = 'ABCD1234EFGH';

async function main() {
  const db = openDb();

  try {
    await exec(db, 'PRAGMA foreign_keys = ON;');

    await run(
      db,
      `
      INSERT INTO owners (slug, display_name, whatsapp, email, note)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        display_name = excluded.display_name,
        whatsapp = excluded.whatsapp,
        email = excluded.email,
        note = excluded.note
    `,
      [
        SAMPLE_SLUG,
        'Budi Santoso',
        '6281234567890',
        'budi@example.com',
        'Pemilik resmi bandul digital ini.',
      ]
    );

    const owner = await get(db, 'SELECT id FROM owners WHERE slug = ?', [SAMPLE_SLUG]);

    await run(
      db,
      `
      INSERT INTO codes (code, owner_id, is_active)
      VALUES (?, ?, 1)
      ON CONFLICT(code) DO UPDATE SET
        owner_id = excluded.owner_id,
        is_active = 1
    `,
      [SAMPLE_CODE, owner.id]
    );

    console.log(`Database seeded. Sample code: ${SAMPLE_CODE}`);
  } finally {
    await close(db);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
