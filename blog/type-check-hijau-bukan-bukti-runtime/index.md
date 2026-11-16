# Type Check dan Test Hijau Tidak Membuktikan Perilaku Runtime

- URL: https://hadymaggot.github.io/blog/type-check-hijau-bukan-bukti-runtime/
- Tanggal: 2026-10-30
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Frontend, Vue, Testing

> Prop boolean opsional pada komponen bersama dapat mengubah perilaku di puluhan tempat, sementara type check dan unit test tetap hijau.

Penambahan prop `open?: boolean` pada komponen collapsible yang dipakai di sekitar 20 tempat membuat semua pemakaian tanpa `v-model:open` tampil tertutup. `vue-tsc --noEmit` dan vitest hijau sebelum maupun sesudah bug, karena tipenya benar dan yang berubah hanya perilakunya.

Penyebabnya, Vue meng-cast prop boolean yang tidak diberikan induk menjadi `false`, bukan `undefined`. Akibatnya ekspresi `props.open ?? internal.value` tidak pernah memilih nilai internal. Perbaikannya satu baris pada default prop.

```
const props = withDefaults(defineProps<{ open?: boolean }>(), { open: undefined })
```

### Menyamar sebagai tes flaky

Kelas bug ini sering terlihat sebagai tes E2E yang flaky. Elemen ada di DOM tetapi `display: none`, sehingga `fill()` atau `click()` menunggu sampai timeout. Jika sebuah langkah E2E tiba-tiba timeout pada elemen yang jelas ada, periksa visibilitasnya sebelum menyalahkan timing.

### Cara memverifikasi

Untuk perubahan prop pada komponen bersama, muat satu halaman nyata sebelum menyatakan bahwa perilaku lama tidak berubah. Hasil membaca kode bukan hasil verifikasi. Cara tercepat adalah spec Playwright sekali pakai yang membaca `getComputedStyle(...).display` pada elemen terkait, lalu dihapus setelah pertanyaannya terjawab.
