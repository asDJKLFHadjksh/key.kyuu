const path = require('path');
const express = require('express');
const { PORT } = require('./config');
const { openDb, get, close } = require('./db');

const app = express();

app.use(express.json());
app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));
app.use(express.static(path.join(process.cwd(), 'public')));

function isValidCode(code) {
  return /^[A-Z0-9]{12}$/.test(code);
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/lookup', async (req, res) => {
  const rawCode = req.body?.code;
  const code = String(rawCode || '').toUpperCase();

  if (!isValidCode(code)) {
    return res.status(400).json({ ok: false, error: 'invalid_code' });
  }

  const db = openDb();

  try {
    const row = await get(
      db,
      `SELECT c.code, c.is_active, o.slug
       FROM codes c
       JOIN owners o ON o.id = c.owner_id
       WHERE c.code = ?`,
      [code]
    );

    if (!row) {
      return res.status(404).json({ ok: false, error: 'not_found' });
    }

    if (!row.is_active) {
      return res.status(410).json({ ok: false, error: 'inactive' });
    }

    return res.status(200).json({ ok: true, redirect: `/p/${row.slug}` });
  } catch (_error) {
    return res.status(500).json({ ok: false, error: 'server_error' });
  } finally {
    await close(db);
  }
});

app.get('/p/:slug', async (req, res) => {
  const { slug } = req.params;
  const db = openDb();

  try {
    const owner = await get(
      db,
      `SELECT o.id, o.slug, o.display_name, o.whatsapp, o.email, o.note
       FROM owners o
       WHERE o.slug = ?`,
      [slug]
    );

    if (!owner) {
      return res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
    }

    const whatsappNumber = digitsOnly(owner.whatsapp);
    const waButton = whatsappNumber
      ? `<a class="btn-primary" href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer">Hubungi WhatsApp</a>`
      : '';

    const emailButton = owner.email
      ? `<a class="btn-secondary" href="mailto:${escapeHtml(owner.email)}">Kirim Email</a>`
      : '';

    const note = owner.note
      ? `<p style="margin-top:1rem; opacity:.9;">${escapeHtml(owner.note)}</p>`
      : '';

    return res.send(`<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Profil Pemilik - ${escapeHtml(owner.display_name)}</title>
  <link rel="stylesheet" href="/assets/theme.css" />
</head>
<body>
  <section class="panel">
    <h1>${escapeHtml(owner.display_name)}</h1>
    <p class="subtitle">Jika Anda menemukan barang ini, silakan hubungi pemilik.</p>
    <div style="display:flex; gap:.7rem; justify-content:center; flex-wrap:wrap; margin-top:.6rem;">${waButton}${emailButton}</div>
    ${note}
  </section>
</body>
</html>`);
  } catch (_error) {
    return res.status(500).send('Terjadi kesalahan pada server.');
  } finally {
    await close(db);
  }
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
