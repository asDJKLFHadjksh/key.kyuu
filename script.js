const VALID_CODE = 'K19UH49USTY4';
const form = document.getElementById('code-form');
const input = document.getElementById('code');
const message = document.getElementById('message');

const normalizeCode = (value) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

input?.addEventListener('input', (event) => {
  const raw = normalizeCode(event.target.value).slice(0, 12);
  const grouped = raw.match(/.{1,4}/g)?.join('-') ?? '';
  event.target.value = grouped;
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const normalized = normalizeCode(input.value);

  if (normalized !== VALID_CODE) {
    message.textContent = 'Code invalid. Pastikan kode benar (contoh format: XXXX-XXXX-XXXX).';
    message.classList.add('error');
    return;
  }

  message.textContent = 'Kode valid. Mengarahkan ke direct link...';
  message.classList.remove('error');
  window.location.href = 'direct-link.html';
});
