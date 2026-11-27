# Urutan Layer Peta: localStorage untuk Preferensi Pengguna

- URL: https://hadymaggot.github.io/blog/urutan-layer-peta-localstorage-preferensi-pengguna/
- Tanggal: 2026-11-27
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Frontend, Web Development, Testing

> Urutan tampilan layer adalah preferensi per pengguna. Simpan di localStorage, bukan endpoint server, dan uji drag-and-drop dengan mouse bertahap.

Panel layer pada aplikasi peta menentukan layer mana yang digambar di atas dan mana yang di bawah. Pertanyaan desainnya adalah apakah urutan itu pengaturan bersama atau preferensi tiap pengguna. Jika satu pengguna menyeret layer lalu hasilnya disimpan lewat endpoint ke database, semua pengguna lain melihat peta dengan susunan yang berubah tanpa mereka minta. Endpoint itu juga menuntut aturan authorization: siapa yang boleh mengubah dan apakah perubahan perlu dicatat.

### Simpan di localStorage, bukan di server

Urutan tampilan adalah preferensi, sehingga cukup disimpan di browser pemiliknya. Tidak ada endpoint, tidak ada tabel tambahan, dan tidak ada migration. Yang disimpan hanya daftar id layer dalam urutan yang dipilih. Layer baru yang belum ada di daftar tersimpan jatuh ke urutan default, dan id yang sudah tidak ada diabaikan.
const KEY = 'map.layerOrder';

export function loadOrder() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}

export function saveOrder(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function sortLayers(layers, saved) {
  const rank = new Map(saved.map((id, i) => [id, i]));
  const r = (l) => rank.get(l.id) ?? saved.length;
  return [...layers].sort((a, b) => r(a) - r(b) || a.order - b.order);
}
Konsekuensinya perlu diterima sejak awal: susunan hanya berlaku di satu browser, hilang jika data situs dihapus, dan tidak ikut berpindah ke perangkat lain. Untuk preferensi tampilan, batasan itu wajar. Baris teratas di panel digambar paling atas, dan aturan ini cukup diterapkan di satu fungsi pengurut agar peta dan panel tidak berselisih.

### Nomor urut default tetap di server

Urutan bawaan yang berlaku bagi semua orang sebaiknya otomatis dan unik. Nomor diisi saat penyimpanan sebagai nilai maksimum ditambah satu, sehingga form tidak perlu menyediakan isian nomor.
def save(self, *args, **kwargs):
    if self.order is None:
        last = type(self).objects.aggregate(m=Max('order'))['m'] or 0
        self.order = last + 1
    super().save(*args, **kwargs)
Data lama yang nomornya bentrok atau berlubang dinomori ulang lewat satu migration. Pola maksimum ditambah satu tidak aman terhadap dua penyimpanan bersamaan, jadi constraint unique pada kolom itu tetap diperlukan sebagai pengaman.

### Menguji drag-and-drop di Playwright

Drag-and-drop bawaan HTML memakai event dragstart, dragover, dan drop. Method dragTo pada Playwright sering tidak memicu rangkaian event itu pada elemen draggable. Gerakan mouse manual dengan langkah bertahap memicunya.
const from = await rows.nth(2).boundingBox();
const to = await rows.nth(0).boundingBox();
await page.mouse.move(from.x + 10, from.y + 10);
await page.mouse.down();
await page.mouse.move(to.x + 10, to.y + 5, { steps: 10 });
await page.mouse.up();
Parameter steps penting karena browser perlu menerima beberapa event pergerakan sebelum menganggap gerakan itu sebagai drag. API drag-and-drop HTML juga tidak bekerja pada layar sentuh tanpa tambahan library atau penanganan touch event, sehingga dukungan perangkat mobile harus dicatat sebagai pekerjaan terpisah.
