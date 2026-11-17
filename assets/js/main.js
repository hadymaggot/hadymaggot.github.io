

// Typing effect
const commands = [
    "nmap -sS -sV --script vuln target.com",
    "tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn) != 0'",
    "netstat -n | grep SYN_RECV | wc -l",
    "fail2ban-client status",
    "waf-log-analysis.sh | grep 'HTTP flood'",
    "iptables -L INPUT | grep DROP",
    "wapiti3 -u https://example.com -f html -o wapiti_report.html",
    "nikto -h example.com -o nikto_scan.txt",
    "sqlmap -u 'http://example.com/page?id=1' --batch --dump-all",
    "metasploit-framework -x 'use exploit/windows/smb/ms17_010_eternalblue'",
    "ansible-playbook deploy.yml --tags 'security' --check",
    "kubectl apply -f security-policy.yaml --dry-run=server",
    "terraform plan -var-file=prod.tfvars -out=plan.out",
    "docker scan --file Dockerfile --json --severity HIGH",
    "aws ec2 describe-security-groups --filters Name=group-name,Values=default",
    "gcloud compute firewall-rules list --format=json",
    "az network nsg list --query '[].{Name:name, Rules:securityRules[].name}'"
];
let currentCommand = 0;
let i = 0;
const typingElement = document.getElementById("typing");

// Tambahkan variabel untuk melacak timeout
let currentTypingTimeout = null;
let currentCommandTimeout = null;

// Fungsi untuk membersihkan timeout yang sedang berjalan
function clearTypingTimeouts() {
    if (currentTypingTimeout) {
        clearTimeout(currentTypingTimeout);
        currentTypingTimeout = null;
    }
    if (currentCommandTimeout) {
        clearTimeout(currentCommandTimeout);
        currentCommandTimeout = null;
    }
}

let isTyping = false;

function typeWriter() {
    if (!typingElement) return;
    
    if (i < commands[currentCommand].length) {
        typingElement.textContent = commands[currentCommand].substring(0, i + 1);
        i++;
        setTimeout(typeWriter, Math.random() * 100 + 50);
    } else {
        setTimeout(() => {
            i = 0;
            typingElement.textContent = "";
            currentCommand = (currentCommand + 1) % commands.length;
            setTimeout(typeWriter, 1000);
        }, 2000);
    }
}

// Mulai typing setelah DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typingElement) {
        setTimeout(typeWriter, 1000);
    }
});

const projects = [
    { name: 'security-audit-kit', url: 'https://github.com/hadymaggot/security-audit-kit', tag: 'security',
      desc: 'Toolkit security testing berbasis config: access control, kebocoran di klien, TLS dan header, CVE dependensi, dengan laporan HTML/MD.' },
    { name: 'sql_geojson', url: 'https://github.com/hadymaggot/hadymaggot.github.io/tree/main/tools/sql_geojson', tag: 'tools',
      desc: 'Konverter SQL ke GeoJSON dan sebaliknya, lengkap dengan test dan CI.' },
    { name: 'private-tunneling', url: 'https://github.com/hadymaggot/private-tunneling', tag: 'ops',
      desc: 'Skrip SSH tunneling privat.' },
    { name: 'mailserver', url: 'https://github.com/hadymaggot/mailserver', tag: 'ops',
      desc: 'Setup mail server dengan docker-mailserver.' },
    { name: 'hadymaggot.github.io', url: 'https://github.com/hadymaggot/hadymaggot.github.io', tag: 'web',
      desc: 'Situs ini: terminal interaktif sebagai menu, blog statis dengan RSS dan llms.txt, serta tool sql_geojson.' },
    { name: '9hs-ubuntu-fancyprompt', url: 'https://github.com/hadymaggot/9hs-ubuntu-fancyprompt', tag: 'ops',
      desc: 'Prompt shell Ubuntu yang informatif.' }
];
const wrtProjects = [
    { name: 'sistem-tata-kelola-regulasi', stack: 'TypeScript, Vue', desc: 'Sistem informasi tata kelola regulasi.' },
    { name: 'aplikasi-pelaporan-emisi', stack: 'PHP', desc: 'Perhitungan dan pelaporan data emisi.' },
    { name: 'sistem-monitoring-anggaran', stack: 'PHP (CodeIgniter 4), JavaScript', desc: 'Monitoring kinerja pelaksanaan anggaran: aplikasi dan API integrasi.' },
    { name: 'dashboard-pemantauan-patroli', stack: 'Python (Django), Vue', desc: 'Dashboard pemantauan patroli dan indikator pengelolaan kawasan, dengan data spasial.' },
    { name: 'importir-wrt', stack: 'Python', desc: 'Engine katalog dataset dinamis, beserta penerbit dan pemvalidasi lisensinya.' },
    { name: 'titip-absen', stack: 'TypeScript', desc: 'Absensi personil proyek.' },
    { name: 'wrt-compro', stack: 'JavaScript', desc: 'Company profile Wahana Reka Tekindo.' },
    { name: 'wrt-web-api', stack: 'PHP', desc: 'Situs dan API Wahana Reka Tekindo, termasuk situs demo.' },
    { name: 'wrt-filamentz', stack: 'Filament', desc: 'Aplikasi web berbasis Filament.' },
    { name: 'wrt-template', stack: 'Blade', desc: 'Template dasar aplikasi web.' },
    { name: 'frontend-platform-usaha-desa', stack: 'Frontend', desc: 'Antarmuka platform usaha desa.' },
    { name: 'koperasi-digital', stack: 'TypeScript', desc: 'Platform koperasi digital.' },
    { name: 'wrt-gis', stack: 'Vue (Quasar)', desc: 'Kerangka WebGIS dengan OpenLayers, MapLibre, Turf.js, dan proj4.' }
];
const ossProjects = [
    { name: 'torproject/community', url: 'https://github.com/torproject/community/pull/149',
      desc: 'Dokumentasi relay Tor: menambahkan rujukan ke FAQ Support Portal pada halaman Getting help untuk relay operator. Di-merge pada 2021.' }
];
const otherProjects = [
    { name: 'sirus-2022', stack: 'PHP', desc: 'Sistem Informasi Rumah Swadaya (SIRUS).' },
    { name: 'bsps-api', stack: 'Laravel', desc: 'API Laravel untuk bantuan stimulan perumahan swadaya (BSPS), dengan koleksi Postman.' },
    { name: 'sisatker', stack: 'CodeIgniter', desc: 'Aplikasi web CodeIgniter dengan template Stisla.' },
    { name: 'stantek', stack: 'CodeIgniter', desc: 'Aplikasi web CodeIgniter dengan template Stisla.' },
    { name: 'aplikasi-web-skala-besar', stack: 'PHP, Vue', desc: 'Aplikasi web dengan kode dasar besar dan banyak kontributor, sekitar 300 commit saya di dalamnya.' },
    { name: 'platform-webgis', stack: 'JavaScript, Vue', desc: 'Platform WebGIS dengan engine peta kustom: layer, proyeksi, dan pengolahan shapefile.' }
];

// Projects: satu terminal dengan tab per kelompok, seperti jendela tmux
const projectTabs = [
    { key: 'publik', label: 'publik', cmd: 'ls -la projects/publik/' },
    { key: 'wahana', label: 'wahana', cmd: 'ls -la projects/wahana-reka-tekindo/' },
    { key: 'lainnya', label: 'lainnya', cmd: 'ls -la projects/lainnya/' },
    { key: 'open-source', label: 'open-source', cmd: 'ls -la projects/open-source/' }
];

const linkAttr = 'target="_blank" rel="noopener noreferrer"';
const projectItemLink = (p, tag, tagClass) => `<li><a class="term-link" href="${p.url}" ${linkAttr}>${p.name}</a>
    <span class="project-tag project-tag-${tagClass}">${tag}</span><br>${p.desc}</li>`;
const projectItemPrivate = (p) => `<li>${p.name}
    <span class="project-tag project-tag-private">${p.stack}</span><br>${p.desc}</li>`;

function projectPanel(key) {
    switch (key) {
        case 'wahana':
            return `total ${wrtProjects.length}<div>drwxr-xr-x wahana-reka-tekindo/ (repo privat, tanpa tautan)</div>` +
                `<ul class="project-list">${wrtProjects.map(projectItemPrivate).join('')}</ul>` +
                `<p>Perusahaan: <a class="term-link" href="https://wahanarekatekindo.co.id" ${linkAttr}>wahanarekatekindo.co.id</a></p>`;
        case 'lainnya':
            return `total ${otherProjects.length}<div>drwxr-xr-x lainnya/ (repo privat, tanpa tautan)</div>` +
                `<ul class="project-list">${otherProjects.map(projectItemPrivate).join('')}</ul>`;
        case 'open-source':
            return `total ${ossProjects.length}<div>drwxr-xr-x open-source/ (kontribusi pada proyek orang lain)</div>` +
                `<ul class="project-list">${ossProjects.map(p => projectItemLink(p, 'open source', 'oss')).join('')}</ul>`;
        default:
            return `total ${projects.length}<ul class="project-list">${projects.map(p => projectItemLink(p, p.tag, p.tag)).join('')}</ul>` +
                `<p>Selengkapnya: <a class="term-link" href="https://github.com/hadymaggot/" ${linkAttr}>github.com/hadymaggot</a></p>`;
    }
}

// Isi satu tab: hanya panelnya; bilah tab berada di header terminal
function renderProjects(key) {
    const aktif = projectTabs.find(t => t.key === key) || projectTabs[0];
    return `<div id="panel-projects" role="tabpanel" aria-labelledby="tab-${aktif.key}">${projectPanel(aktif.key)}</div>`;
}

// Bilah tab ala emulator terminal: dipasang sekali di header, lalu hanya status aktifnya yang diperbarui
function pasangTab() {
    let bar = document.querySelector('.term-tabs');
    if (bar) return bar;
    const header = document.querySelector('.terminal-header');
    if (!header) return null;
    bar = document.createElement('div');
    bar.className = 'term-tabs';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'Kelompok proyek');
    bar.hidden = true;
    bar.innerHTML = projectTabs.map(t => `<button type="button" class="term-tab" role="tab" id="tab-${t.key}" data-key="${t.key}" ` +
        `aria-controls="panel-projects"><span class="tab-icon" aria-hidden="true">&gt;_</span><span class="tab-name">${t.label}</span></button>`).join('');
    header.appendChild(bar);
    return bar;
}

function tampilkanTab(key) {
    const bar = pasangTab();
    if (!bar) return;
    bar.hidden = false;
    document.querySelector('.terminal-header').classList.add('has-tabs');
    const judul = document.querySelector('.terminal-title');
    if (judul) judul.hidden = true;
    bar.querySelectorAll('.term-tab').forEach(t => {
        const aktif = t.dataset.key === key;
        t.setAttribute('aria-selected', String(aktif));
        t.tabIndex = aktif ? 0 : -1;
    });
}

function sembunyikanTab() {
    const bar = document.querySelector('.term-tabs');
    if (!bar) return;
    bar.hidden = true;
    document.querySelector('.terminal-header').classList.remove('has-tabs');
    const judul = document.querySelector('.terminal-title');
    if (judul) judul.hidden = false;
}

// Menampilkan satu perintah di terminal: ketik perintahnya, lalu tampilkan keluarannya.
// cepat: pengetikan singkat untuk perpindahan tab.
function showCommand(command, output, { cepat = false } = {}) {
    clearTypingTimeouts();
    sembunyikanSkills();
    const terminalContent = document.querySelector('.terminal-content');
    terminalContent.innerHTML = `
        <div class="command-line">
            <span class="prompt">ahadi@zapto:~$</span>
            <span class="command" id="typing-nav"></span>
        </div>
    `;
    const barisPerintah = document.getElementById('typing-nav');
    let i = 0;
    function ketik() {
        if (i < command.length) {
            barisPerintah.innerHTML = command.substring(0, i + 1) + '<span class="blink">█</span>';
            i++;
            currentTypingTimeout = setTimeout(ketik, cepat ? Math.random() * 15 + 10 : Math.random() * 100 + 50);
        } else {
            const outputDiv = document.createElement('div');
            outputDiv.className = 'output';
            outputDiv.innerHTML = output;
            terminalContent.appendChild(outputDiv);
        }
    }
    ketik();
}

function bukaProjects(key, { fokus = false } = {}) {
    const tab = projectTabs.find(t => t.key === key) || projectTabs[0];
    history.replaceState(null, '', '#projects/' + tab.key);
    tampilkanTab(tab.key);
    if (fokus) document.getElementById('tab-' + tab.key).focus();
    showCommand(tab.cmd, renderProjects(tab.key), { cepat: true });
}

document.addEventListener('click', (e) => {
    const tab = e.target.closest && e.target.closest('.term-tab');
    if (tab) bukaProjects(tab.dataset.key);
});

// Panah kiri dan kanan, Home, dan End berpindah antar tab (pola tab WAI-ARIA)
document.addEventListener('keydown', (e) => {
    const tab = e.target.closest && e.target.closest('.term-tab');
    if (!tab) return;
    const idx = projectTabs.findIndex(t => t.key === tab.dataset.key);
    let tujuan = null;
    if (e.key === 'ArrowRight') tujuan = (idx + 1) % projectTabs.length;
    else if (e.key === 'ArrowLeft') tujuan = (idx - 1 + projectTabs.length) % projectTabs.length;
    else if (e.key === 'Home') tujuan = 0;
    else if (e.key === 'End') tujuan = projectTabs.length - 1;
    if (tujuan === null) return;
    e.preventDefault();
    bukaProjects(projectTabs[tujuan].key, { fokus: true });
});

// Tautan dalam, mis. /#projects/open-source
document.addEventListener('DOMContentLoaded', () => {
    const m = location.hash.match(/^#projects(?:\/([\w-]+))?$/);
    if (m && document.querySelector('.terminal-content')) bukaProjects(m[1]);
});

// Skills: peta rasi bintang. Tiap skill adalah bintang; makin dekat pusat makin banyak buktinya, dan garis
// menghubungkan skill yang dibahas pada artikel yang sama.
let dataSkill = null;

async function muatSkill() {
    if (dataSkill !== null) return dataSkill;
    try {
        const res = await fetch('/assets/data/skills-evidence.json');
        dataSkill = res.ok ? await res.json() : false;
    } catch (e) {
        dataSkill = false;
    }
    return dataSkill;
}

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KATEGORI = [
    { k: 'dev', nama: 'Dev', warna: '122,197,90' },
    { k: 'ops', nama: 'Ops', warna: '95,214,196' },
    { k: 'security', nama: 'Security', warna: '233,196,106' },
    { k: 'gis', nama: 'GIS', warna: '195,219,101' }
];
const infoKategori = (k) => KATEGORI.find(c => c.k === k);
const RADIUS_LEVEL = [0.97, 0.8, 0.6, 0.37]; // indeks = level bukti: 0 tanpa bukti ... 3 paling banyak
const levelBukti = (j) => (j >= 4 ? 3 : j >= 2 ? 2 : j >= 1 ? 1 : 0);
const acak = (t) => { let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) | 0; return ((h >>> 0) % 1000) / 1000; };

// Posisi tiap skill: sektor per kategori (atau satu kategori penuh saat difokuskan), cincin menurut bukti,
// lalu dilonggarkan beberapa putaran agar label tidak saling menimpa.
function tataLetak(semua, W, H, fokus) {
    const cx = W / 2, cy = H / 2, rx = W * 0.45, ry = H * 0.42;
    const tampil = fokus ? semua.filter(s => s.g === fokus) : semua;
    const pos = new Map();
    const letakkan = (arr, mulai, rentang) => {
        for (let lv = 3; lv >= 0; lv--) {
            const grup = arr.filter(s => s.lv === lv);
            grup.forEach((s, i) => {
                const sudut = mulai + rentang * ((i + 0.5) / grup.length) + (acak(s.n) - 0.5) * (rentang / grup.length) * 0.5 + lv * 0.3;
                const r = RADIUS_LEVEL[lv] + (acak(s.n + 'r') - 0.5) * 0.05;
                pos.set(s.n, { x: cx + rx * r * Math.cos(sudut), y: cy + ry * r * Math.sin(sudut) });
            });
        }
    };
    if (fokus) {
        letakkan(tampil, -Math.PI / 2, Math.PI * 2);
    } else {
        const jeda = 0.32, sisa = Math.PI * 2 - jeda * KATEGORI.length;
        let mulai = -Math.PI / 2 + jeda / 2;
        KATEGORI.forEach(c => {
            const arr = semua.filter(s => s.g === c.k);
            const rentang = sisa * arr.length / semua.length;
            letakkan(arr, mulai, rentang);
            mulai += rentang + jeda;
        });
    }
    const mini = !fokus && W < 560; // layar kecil: hanya bukti terbanyak yang berlabel, yang lain cukup titik
    const kotak = tampil.map(s => (mini && s.lv < 3 ? { p: pos.get(s.n), w: 22, h: 22 } : { p: pos.get(s.n), w: Math.max(34, s.n.length * 7.3 + 14), h: 40 }));
    for (let putaran = 0; putaran < 160; putaran++) {
        for (let i = 0; i < kotak.length; i++) {
            const a = kotak[i];
            const dxh = a.p.x - cx, dyh = a.p.y - cy; // jauhkan dari pusat (logo)
            const oxh = (a.w + 120) / 2 - Math.abs(dxh), oyh = (36 + 70) / 2 - Math.abs(dyh);
            if (oxh > 0 && oyh > 0) { if (oyh < oxh) a.p.y += (dyh >= 0 ? 1 : -1) * oyh; else a.p.x += (dxh >= 0 ? 1 : -1) * oxh; }
            for (let j = i + 1; j < kotak.length; j++) {
                const b = kotak[j];
                const dx = b.p.x - a.p.x, dy = b.p.y - a.p.y;
                const ox = (a.w + b.w) / 2 - Math.abs(dx), oy = (a.h + b.h) / 2 - Math.abs(dy);
                if (ox > 0 && oy > 0) {
                    if (oy < ox) { const g = (dy >= 0 ? 1 : -1) * oy / 2; a.p.y -= g; b.p.y += g; }
                    else { const g = (dx >= 0 ? 1 : -1) * ox / 2; a.p.x -= g; b.p.x += g; }
                }
            }
        }
        kotak.forEach(k => {
            k.p.x = Math.min(W - k.w / 2 - 6, Math.max(k.w / 2 + 6, k.p.x));
            k.p.y = Math.min(H - 30, Math.max(14, k.p.y));
        });
    }
    return { pos, cx, cy, rx, ry };
}

// Pasangan skill yang dibahas pada artikel yang sama; bobot = jumlah artikel bersama
function hitungGaris(skills) {
    const perArtikel = new Map();
    skills.forEach(s => s.a.forEach(a => {
        if (!perArtikel.has(a.id)) perArtikel.set(a.id, []);
        perArtikel.get(a.id).push(s.n);
    }));
    const bobot = new Map();
    perArtikel.forEach(nama => {
        for (let i = 0; i < nama.length; i++) {
            for (let j = i + 1; j < nama.length; j++) {
                const k = [nama[i], nama[j]].sort().join('|');
                bobot.set(k, (bobot.get(k) || 0) + 1);
            }
        }
    });
    return [...bobot].map(([k, w]) => { const [a, b] = k.split('|'); return { a, b, w }; }).sort((x, y) => y.w - x.w || (x.a + x.b).localeCompare(y.a + y.b));
}

function buatPeta(data) {
    const hud = document.createElement('section');
    hud.id = 'skill-hud';
    hud.className = 'skill-hud';
    hud.hidden = true;
    hud.setAttribute('aria-label', 'Peta skill');
    if (!data) {
        hud.innerHTML = '<p class="sk-galat">Data skill tidak dapat dimuat. Daftar lengkapnya ada di <a href="/llms.txt">llms.txt</a>.</p>';
        return hud;
    }
    const skills = data.skills.map(s => ({ ...s, j: s.a.length + s.p.length, lv: levelBukti(s.a.length + s.p.length) }));
    const garisSemua = hitungGaris(skills);
    const negara = { fokus: null, pin: null, ukuran: '' };
    const jumlah = (k) => skills.filter(s => s.g === k).length;

    hud.innerHTML =
        `<div class="sk-bintang" aria-hidden="true"></div>` +
        `<header class="sk-top"><div class="sk-judul"><span>skill.map</span><strong>Peta skill</strong></div>` +
        `<div class="sk-legend" role="group" aria-label="Kategori skill"><button type="button" class="sk-cat is-aktif" data-k="" aria-pressed="true">Semua<em>${skills.length}</em></button>` +
        KATEGORI.map(c => `<button type="button" class="sk-cat" data-k="${c.k}" style="--w:${c.warna}" aria-pressed="false"><i aria-hidden="true"></i>${c.nama}<em>${jumlah(c.k)}</em></button>`).join('') +
        `</div></header>` +
        `<div class="sk-isi"><div class="sk-kanvas"><div class="sk-nebula" aria-hidden="true"></div><svg class="sk-garis" aria-hidden="true"></svg>` +
        `<div class="sk-hub" aria-hidden="true"><span>SAPTO</span><small>skills</small></div>` +
        `<div class="sk-bintang-skill">` +
        skills.map((s, i) => `<button type="button" class="sk-node" data-n="${esc(s.n)}" data-lv="${s.lv}" data-k="${s.g}" style="--w:${infoKategori(s.g).warna};--i:${i};--d:${s.j ? 9 + Math.min(s.j, 8) * 1.7 : 6}px">` +
            `<span class="sk-dot"></span><span class="sk-label">${esc(s.n)}</span></button>`).join('') +
        `</div></div><aside class="sk-kartu" role="status" aria-live="polite"></aside></div>` +
        `<footer class="sk-kaki"><span>Makin dekat pusat, makin banyak bukti. Garis menghubungkan skill yang dibahas pada artikel yang sama.</span>` +
        `<span>${data.ringkas.berbukti} dari ${data.ringkas.skill} skill berbukti &middot; ${data.ringkas.artikel} artikel</span></footer>`;

    const kanvas = hud.querySelector('.sk-kanvas');
    const svg = hud.querySelector('.sk-garis');
    const nebula = hud.querySelector('.sk-nebula');
    const kartu = hud.querySelector('.sk-kartu');
    const simpul = new Map([...hud.querySelectorAll('.sk-node')].map(el => [el.dataset.n, el]));
    const NS = 'http://www.w3.org/2000/svg';
    let garisTampil = [];

    const teratas = [...skills].sort((x, y) => y.j - x.j || x.n.localeCompare(y.n)).slice(0, 5);
    const kartuAwal = () => {
        kartu.innerHTML = `<p class="sk-kartu-judul">Pilih sebuah bintang</p>` +
            `<p class="sk-kartu-isi"><span class="sk-lg">Arahkan kursor atau ketuk sebuah skill untuk melihat artikel dan proyek yang membuktikannya.</span>` +
            `<span class="sk-sm">Ketuk sebuah skill untuk melihat buktinya.</span></p>` +
            `<p class="sk-subjudul">Paling banyak dibuktikan</p><ul class="sk-peringkat">` +
            teratas.map(s => `<li><button type="button" class="sk-top-btn" data-n="${esc(s.n)}" style="--w:${infoKategori(s.g).warna}">` +
                `<span>${esc(s.n)}</span><b><i style="width:${Math.round(s.j / teratas[0].j * 100)}%"></i></b><em>${s.j}</em></button></li>`).join('') + `</ul>` +
            `<ul class="sk-kunci"><li><i class="besar"></i>bukti banyak</li><li><i class="sedang"></i>bukti sedikit</li><li><i class="kosong"></i>belum ada bukti publik</li></ul>`;
    };

    const tetangga = (nama) => {
        const set = new Set();
        garisTampil.forEach(g => { if (g.a === nama) set.add(g.b); else if (g.b === nama) set.add(g.a); });
        return set;
    };

    const kartuSkill = (s) => {
        const kat = infoKategori(s.g);
        const rel = [...tetangga(s.n)].slice(0, 7);
        let h = `<div class="sk-kartu-kepala" style="--w:${kat.warna}"><i></i><strong>${esc(s.n)}</strong><span>${kat.nama}</span></div>`;
        if (!s.j) {
            h += `<p class="sk-kartu-isi">Belum ada tulisan atau proyek publik untuk skill ini.</p>`;
        } else {
            h += `<p class="sk-kartu-isi">${s.a.length ? s.a.length + ' artikel' : ''}${s.a.length && s.p.length ? ' &middot; ' : ''}${s.p.length ? s.p.length + ' proyek' : ''}</p>`;
            if (s.a.length) {
                h += `<ul class="sk-daftar">` + s.a.slice(0, 4).map(a => `<li><a href="/blog/${esc(a.id)}/">${esc(a.t)}</a></li>`).join('') + `</ul>`;
                if (s.tag) h += `<a class="sk-semua" href="/blog/tag/${esc(s.tag)}/">Semua artikel &rarr;</a>`;
            }
            if (s.p.length) h += `<p class="sk-proyek">Proyek: ` + s.p.map(n => `<a href="${esc(data.proyek[n])}" target="_blank" rel="noopener noreferrer">${esc(n)}</a>`).join(', ') + `</p>`;
        }
        if (rel.length) h += `<p class="sk-rel">Sering bersama: ${rel.map(esc).join(' &middot; ')}</p>`;
        kartu.innerHTML = h;
    };

    const sorot = (nama) => {
        kanvas.classList.toggle('is-sorot', !!nama);
        const dekat = nama ? tetangga(nama) : new Set();
        simpul.forEach((el, n) => {
            el.classList.toggle('is-aktif', n === nama);
            el.classList.toggle('is-tetangga', dekat.has(n));
        });
        svg.querySelectorAll('.sk-garis-item').forEach(p => p.classList.toggle('is-aktif', !!nama && (p.dataset.a === nama || p.dataset.b === nama)));
        if (nama) kartuSkill(skills.find(s => s.n === nama)); else kartuAwal();
    };

    const susun = (awal) => {
        const W = kanvas.clientWidth, H = kanvas.clientHeight;
        if (!W || !H) return;
        const { pos, cx, cy, rx, ry } = tataLetak(skills, W, H, negara.fokus);
        hud.classList.toggle('sk-kecil', W < 560);
        hud.classList.toggle('sk-fokus', !!negara.fokus);
        simpul.forEach((el, n) => {
            const p = pos.get(n);
            el.classList.toggle('is-sembunyi', !p);
            el.tabIndex = p ? 0 : -1;
            if (p) el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
        });
        // garis, cincin orbit, dan denyut cahaya
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.replaceChildren();
        [0.34, 0.56, 0.77, 0.95].forEach(r => {
            const e = document.createElementNS(NS, 'ellipse');
            e.setAttribute('cx', cx); e.setAttribute('cy', cy); e.setAttribute('rx', rx * r); e.setAttribute('ry', ry * r);
            e.setAttribute('class', 'sk-orbit');
            svg.appendChild(e);
        });
        garisTampil = garisSemua.filter(g => pos.has(g.a) && pos.has(g.b)).slice(0, 150);
        garisTampil.forEach((g, i) => {
            const a = pos.get(g.a), b = pos.get(g.b);
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            const kx = mx + (cx - mx) * 0.4, ky = my + (cy - my) * 0.4;
            const path = document.createElementNS(NS, 'path');
            path.setAttribute('d', `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${kx.toFixed(1)},${ky.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`);
            path.setAttribute('pathLength', '100');
            path.setAttribute('class', 'sk-garis-item');
            path.dataset.a = g.a; path.dataset.b = g.b;
            path.style.setProperty('--b', Math.min(g.w, 3));
            svg.appendChild(path);
            if (i < 12) { // denyut cahaya mengalir di garis terkuat
                const denyut = path.cloneNode();
                denyut.setAttribute('class', 'sk-denyut');
                denyut.style.setProperty('--dl', `${(i * 0.7).toFixed(1)}s`);
                svg.appendChild(denyut);
            }
        });
        // cahaya latar per kategori
        nebula.replaceChildren();
        const sebaran = negara.fokus ? [{ k: negara.fokus, x: cx, y: cy, r: Math.min(W, H) * 0.55 }]
            : KATEGORI.map(c => {
                const ada = [...pos].filter(([n]) => skills.find(s => s.n === n).g === c.k).map(([, p]) => p);
                return { k: c.k, x: ada.reduce((t, p) => t + p.x, 0) / ada.length, y: ada.reduce((t, p) => t + p.y, 0) / ada.length, r: Math.min(W, H) * 0.34 };
            });
        sebaran.forEach(c => {
            const d = document.createElement('div');
            d.className = 'sk-cahaya';
            d.style.cssText = `--w:${infoKategori(c.k).warna};left:${c.x - c.r}px;top:${c.y - c.r}px;width:${c.r * 2}px;height:${c.r * 2}px`;
            nebula.appendChild(d);
        });
        if (negara.pin) sorot(negara.pin);
        if (awal) hud.classList.add('sk-muncul');
    };

    // animasi masuk: semua bintang keluar dari pusat
    hud.mulai = () => {
        hud.classList.remove('sk-muncul');
        const W = kanvas.clientWidth, H = kanvas.clientHeight;
        simpul.forEach(el => { el.classList.add('is-awal'); el.style.transform = `translate(${W / 2}px, ${H / 2}px)`; });
        requestAnimationFrame(() => requestAnimationFrame(() => {
            simpul.forEach(el => el.classList.remove('is-awal'));
            susun(true);
            setTimeout(() => hud.classList.remove('sk-muncul'), 2400);
        }));
    };

    let ulang = 0;
    new ResizeObserver(() => {
        cancelAnimationFrame(ulang);
        ulang = requestAnimationFrame(() => { const u = kanvas.clientWidth + 'x' + kanvas.clientHeight; if (u !== negara.ukuran) { negara.ukuran = u; if (!hud.hidden) susun(false); } });
    }).observe(kanvas);

    hud.addEventListener('mouseover', (e) => { const n = e.target.closest('.sk-node'); if (n && !negara.pin) sorot(n.dataset.n); });
    hud.addEventListener('mouseout', (e) => { if (e.target.closest('.sk-node') && !negara.pin) sorot(null); });
    hud.addEventListener('focusin', (e) => { const n = e.target.closest('.sk-node'); if (n && !negara.pin) sorot(n.dataset.n); });
    hud.addEventListener('focusout', (e) => { if (e.target.closest('.sk-node') && !negara.pin) sorot(null); });
    hud.addEventListener('click', (e) => {
        const n = e.target.closest('.sk-node');
        const kat = e.target.closest('.sk-cat');
        const top = e.target.closest('.sk-top-btn');
        if (top) {
            const sk = skills.find(x => x.n === top.dataset.n);
            if (negara.fokus && negara.fokus !== sk.g) { negara.fokus = null; hud.querySelectorAll('.sk-cat').forEach(b => { const aktif = !b.dataset.k; b.classList.toggle('is-aktif', aktif); b.setAttribute('aria-pressed', String(aktif)); }); susun(false); }
            negara.pin = sk.n;
            sorot(sk.n);
        } else if (n) {
            negara.pin = negara.pin === n.dataset.n ? null : n.dataset.n;
            sorot(negara.pin || null);
        } else if (kat) {
            negara.fokus = kat.dataset.k || null;
            negara.pin = null;
            hud.querySelectorAll('.sk-cat').forEach(b => { const aktif = b === kat; b.classList.toggle('is-aktif', aktif); b.setAttribute('aria-pressed', String(aktif)); });
            sorot(null);
            susun(false);
        } else if (negara.pin && !e.target.closest('.sk-kartu')) {
            negara.pin = null;
            sorot(null);
        }
    });
    hud.addEventListener('keydown', (e) => { if (e.key === 'Escape' && negara.pin) { negara.pin = null; sorot(null); } });
    kartuAwal();
    return hud;
}

async function bukaSkills() {
    clearTypingTimeouts();
    sembunyikanTab();
    const terminal = document.querySelector('.terminal');
    if (!terminal) return;
    let hud = document.getElementById('skill-hud');
    if (!hud) {
        hud = buatPeta(await muatSkill());
        terminal.insertAdjacentElement('afterend', hud);
    }
    terminal.hidden = true;
    hud.hidden = false;
    if (hud.mulai) hud.mulai();
}

function sembunyikanSkills() {
    const hud = document.getElementById('skill-hud');
    if (hud) hud.hidden = true;
    const terminal = document.querySelector('.terminal');
    if (terminal) terminal.hidden = false;
}

// Add event listeners for navigation links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        // Simulasi terminal hanya ada di beranda; di halaman lain biarkan navigasi normal
        if (!document.querySelector('.terminal-content') || !this.getAttribute('href').startsWith('#')) return;
        e.preventDefault();

        // Hentikan semua typing yang sedang berjalan
        clearTypingTimeouts();
        
        const target = this.getAttribute('href').substring(1);
        let command = '';
        let output = '';

        // Tautan dalam hanya untuk Projects; menu lain membersihkannya
        if (target === 'projects') {
            history.replaceState(null, '', '#projects');
            tampilkanTab(projectTabs[0].key);
        } else {
            sembunyikanTab();
            if (location.hash.startsWith('#projects')) {
                history.replaceState(null, '', location.pathname + location.search);
            }
        }

        switch(target) {
            case 'about':
                command = 'cat about.txt';
                output = `<p>Saya Sapto Hadi (Ahadizapto), software engineer di bidang security dan operations.</p>
                        <p>Bahasa yang saya pakai adalah PHP, JavaScript dan TypeScript, Python, SQL, Bash, PowerShell, dan R. Framework
                            utamanya Laravel di sisi backend, Vue (termasuk Quasar) di frontend, dan Django untuk layanan berbasis Python.</p>
                        <p>Di sisi operations, pekerjaan saya meliputi container dan Kubernetes, infrastructure as code, CI/CD, serta
                            monitoring dan observability.</p>
                        <p>Pengujian keamanan mencakup access control, kebocoran data di sisi client, header dan TLS, serta dependency
                            yang memiliki CVE. Setiap temuan dijadikan test otomatis, sehingga celah yang sama terdeteksi jika muncul
                            kembali.</p>
                        <p>Di bidang GIS, pekerjaan saya mencakup pengolahan data spasial (GeoJSON, shapefile, PostGIS) dan aplikasi peta
                            interaktif dengan MapLibre, Leaflet, dan OpenLayers, termasuk pengelolaan basemap tile dan kode wilayah administrasi.</p>
                        <p>Kontribusi open source: perubahan dokumentasi relay pada Tor Project yang di-merge pada 2021.</p>
                        <p>Catatan teknis dari pekerjaan sehari-hari terbit di blog, mencakup security, operations, dan software engineering.</p>
                        <p>Pengujian keamanan hanya dilakukan pada sistem milik sendiri atau dengan izin tertulis.</p>`;
                break;
            case 'skills':
                bukaSkills();
                return;
            case 'projects':
                command = projectTabs[0].cmd;
                output = renderProjects(projectTabs[0].key);
                break;
            case 'contact':
                command = 'find . -type f -name "contact_info"';
                output = `./contact/<a class="term-link" href="mailto:saptohadi@outlook.com">email.txt</a>
                    ./social/<a class="term-link" href="https://github.com/hadymaggot/" target="_blank" rel="noopener noreferrer">github.com</a>
                    ./social/<a class="term-link" href="https://www.linkedin.com/in/saptohadi/" target="_blank" rel="noopener noreferrer">linkedin.com</a>
                    ./social/<a class="term-link" href="https://x.com/hadymaggot/" target="_blank" rel="noopener noreferrer">x.com</a>
                    ./blog/<a class="term-link" href="/blog.html">blog.html</a>
                    ./blog/<a class="term-link" href="/feed.xml">feed.xml</a>
                    ./security/<a class="term-link" href="/.well-known/security.txt">security.txt</a>`;
                break;
            case '!':
                command = 'whoami';
                output = `<pre class="profile-info">
                 █████╗ ██╗  ██╗ █████╗ ██████╗ ██╗███████╗ █████╗ ██████╗ ████████╗ ██████╗ 
                ██╔══██╗██║  ██║██╔══██╗██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗
                ███████║███████║███████║██║  ██║██║  ███╔╝ ███████║██████╔╝   ██║   ██║   ██║
                ██╔══██║██╔══██║██╔══██║██║  ██║██║ ███╔╝  ██╔══██║██╔═══╝    ██║   ██║   ██║
                ██║  ██║██║  ██║██║  ██║██████╔╝██║███████╗██║  ██║██║        ██║   ╚██████╔╝
                ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝        ╚═╝    ╚═════╝ </pre>
                    <p class="profile-caption">Security | Operations | Software Engineer</p>`;
                break;
            case 'ahadizapto':
                command = 'history | grep "http" | sort | uniq -c | sort -nr | head -n 5';
                output = `
                        86 <a href="https://hadymaggot.github.io" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">hadymaggot.github.io</a>
                        <br>
                        24 <a href="https://wahanarekatekindo.co.id" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">wahanarekatekindo.co.id</a>
                        <br>
                        22 <a href="https://gisliner.atrbpn.go.id" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">gisliner.atrbpn.go.id</a>
                        <br>
                        20 <a href="https://ditjenpptr.atrbpn.go.id" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">ditjenpptr.atrbpn.go.id</a>
                        <br>
                        18 <a href="https://sirus.perumahan.pu.go.id" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">sirus.perumahan.pu.go.id</a>
                `;
                break;
        }

        showCommand(command, output);
    });
});

// Handle mobile notice close
document.querySelector('.mobile-notice .close-btn').addEventListener('click', function() {
    document.querySelector('.mobile-notice').style.display = 'none';
});
document.querySelector('.mobile-notice .close-btn').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
    }
});

// Mobile menu handling
// Menangani menu mobile
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    
    // Mengubah ikon menu
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        body.style.overflow = 'hidden';
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        body.style.overflow = '';
    }
});

// Menutup menu saat mengklik di luar menu
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && 
        !mobileMenuBtn.contains(e.target) && 
        navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        body.style.overflow = '';
    }
});

// Menutup menu saat mengklik link navigasi
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        body.style.overflow = '';
    });
});


// Get User IP Address
// Cache IP and location data with expiration
let cachedIP = {
    value: null,
    timestamp: null
};
let cachedLocation = {
    value: null,
    timestamp: null
};
const CACHE_EXPIRATION = 3600000;

async function getUserIP() {
    // Check cache validity
    if (cachedIP.value && Date.now() - cachedIP.timestamp < CACHE_EXPIRATION) {
        document.getElementById('user-ip').textContent = cachedIP.value;
        return;
    }
    
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        cachedIP = {
            value: data.ip,
            timestamp: Date.now()
        };
        document.getElementById('user-ip').textContent = cachedIP.value;
    } catch (error) {
        document.getElementById('user-ip').textContent = 'Unknown';
        console.error('Error fetching IP:', error);
    }
}

async function getUserLocation() {
    // Check cache validity
    if (cachedLocation.value && Date.now() - cachedLocation.timestamp < CACHE_EXPIRATION) {
        document.getElementById('user-location').textContent = cachedLocation.value;
        return;
    }
    
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || 'Unknown';
                cachedLocation = {
                    value: city,
                    timestamp: Date.now()
                };
                document.getElementById('user-location').textContent = cachedLocation.value;
            }, (err) => { document.getElementById('user-location').textContent = 'Unknown'; }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: CACHE_EXPIRATION
            });
        } else {
            document.getElementById('user-location').textContent = 'Unknown';
        }
    } catch (error) {
        document.getElementById('user-location').textContent = 'Unknown';
        console.error('Error fetching location:', error);
    }
}

// Call these functions only once with debouncing
let ipFetchTimeout;
let locationFetchTimeout;

window.addEventListener('load', function() {
    clearTimeout(ipFetchTimeout);
    ipFetchTimeout = setTimeout(getUserIP, 1000);
    
    clearTimeout(locationFetchTimeout);
    locationFetchTimeout = setTimeout(getUserLocation, 1500);
});


function translateMobileNotice() {
    // Mendapatkan bahasa dari browser dengan prioritas:
    // 1. navigator.languages (array preferensi bahasa)
    // 2. navigator.language
    // 3. navigator.userLanguage (untuk IE)
    const userLang = (navigator.languages && navigator.languages[0]) || 
                    navigator.language || 
                    navigator.userLanguage;

    const noticeText = document.getElementById('mobile-notice-text');

    const translations = {
        'en': 'This website is optimized for desktop view',
        'en-US': 'This website is optimized for desktop view',
        'id': 'Situs web ini dioptimalkan untuk tampilan desktop',
        'es': 'Este sitio web está optimizado para vista de escritorio',
        'fr': 'Ce site web est optimisé pour la vue sur ordinateur',
        'de': 'Diese Website ist für die Desktop-Ansicht optimiert',
        'ja': 'このウェブサイトはデスクトップ表示用に最適化されています',
        'zh': '本网站已针对桌面视图进行优化',
        'ru': 'Этот сайт оптимизирован для просмотра на компьютере',
        'ko': '이 웹사이트는 데스크톱 보기에 최적화되어 있습니다',
        'ar': 'تم تحسين هذا الموقع لعرض سطح المكتب',
        'zh-CN': '本网站已针对桌面视图进行优化'
    };

    // Ambil kode bahasa utama (2 karakter pertama)
    const mainLang = userLang.split('-')[0].toLowerCase();
    
    // Cari terjemahan yang sesuai
    noticeText.textContent = translations[userLang] || 
                            translations[mainLang] || 
                            translations['en'];
}

// Panggil fungsi ini saat halaman dimuat
window.addEventListener('load', function() {
    translateMobileNotice();
});
