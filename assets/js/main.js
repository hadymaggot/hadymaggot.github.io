

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

// Skills: alur kerja dari kode sampai produksi dan jalur data peta; skill menyala sesuai bukti publiknya
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
const jumlahBukti = (sk) => sk.a.length + sk.p.length;
const tingkatBukti = (n) => (n >= 4 ? 3 : n >= 2 ? 2 : 1);
const DETIK_PER_TAHAP = 1.6;

function renderLajur(kunci, judul, tahap) {
    const n = tahap.length;
    const durasi = n * DETIK_PER_TAHAP;
    const bobot = tahap.map(st => Math.max(0.9, 0.55 + 0.13 * st.skills.length));
    const total = bobot.reduce((a, b) => a + b, 0);
    const tengah = bobot.map((w, i) => (bobot.slice(0, i).reduce((a, b) => a + b, 0) + w / 2) / total);
    const awal = tengah[0], akhir = tengah[n - 1];
    const simpul = tahap.map((st, i) => `<button type="button" class="hud-node${st.gerbang ? ' is-gate' : ''}${i === 0 ? ' is-aktif' : ''}" ` +
        `data-tahap="${st.id}" style="--d:${((tengah[i] - awal) / ((akhir - awal) || 1) * durasi).toFixed(2)}s" aria-label="Tahap ${i + 1}: ${esc(st.label)}" title="${esc(st.ket)}" ` +
        `aria-pressed="${i === 0}"><span class="hud-no">${String(i + 1).padStart(2, '0')}</span><i class="fas ${st.ikon}" aria-hidden="true"></i></button>`).join('');
    const kartu = tahap.map((st, i) => {
        const chips = st.skills.map(sk => {
            const j = jumlahBukti(sk);
            return j
                ? `<li><button type="button" class="chip" data-level="${tingkatBukti(j)}" data-lajur="${kunci}" data-tahap="${st.id}" data-skill="${esc(sk.n)}" aria-pressed="false">` +
                  `${esc(sk.n)}<span class="chip-n">${j}</span></button></li>`
                : `<li><span class="chip chip-kosong">${esc(sk.n)}</span></li>`;
        }).join('');
        return `<article class="hud-stage${st.gerbang ? ' is-gate' : ''}${i === 0 ? ' is-aktif' : ''}" data-tahap="${st.id}" style="--i:${i}">` +
            `<h3>${esc(st.label)}</h3><ul class="hud-chips">${chips}</ul></article>`;
    }).join('');
    return `<section class="hud-lane${kunci === 'alur' ? ' is-aktif' : ''}" data-lajur="${kunci}" aria-label="${esc(judul)}" style="--n:${n};--T:${durasi}s;--cols:${bobot.map(w => w.toFixed(2) + 'fr').join(' ')};--ini:${(awal * 100).toFixed(2)}%;--fim:${(akhir * 100).toFixed(2)}%">` +
        `<div class="hud-lane-label">${esc(judul)}</div>` +
        `<div class="hud-rail">${simpul}<span class="hud-paket" aria-hidden="true"></span><span class="hud-paket" style="--w:-${(durasi / 2).toFixed(1)}s" aria-hidden="true"></span></div>` +
        `<div class="hud-stages">${kartu}</div></section>`;
}

const DETAIL_AWAL = 'Skill yang menyala punya tulisan atau proyek publik. Pilih satu untuk melihat buktinya.';

function buatHud(data) {
    const hud = document.createElement('section');
    hud.id = 'skill-hud';
    hud.className = 'skill-hud';
    hud.hidden = true;
    hud.setAttribute('aria-label', 'Skill sebagai alur kerja');
    if (!data) {
        hud.innerHTML = '<p class="hud-detail">Data skill tidak dapat dimuat. Daftar lengkapnya ada di <a href="/llms.txt">llms.txt</a>.</p>';
        return hud;
    }
    const r = data.ringkas;
    hud.innerHTML = `<span class="hud-scan" aria-hidden="true"></span>` +
        `<header class="hud-head"><span class="hud-title"><i class="fas fa-diagram-project" aria-hidden="true"></i> skill.flow</span>` +
        `<span class="hud-meta">${r.berbukti} dari ${r.skill} skill berbukti &middot; ${r.artikel} artikel</span></header>` +
        `<div class="hud-lanebar" role="group" aria-label="Pilih jalur"><button type="button" class="hud-lanebtn is-aktif" data-lajur="alur">Alur kerja</button>` +
        `<button type="button" class="hud-lanebtn" data-lajur="peta">Data peta</button></div>` +
        renderLajur('alur', 'Alur kerja: dari kode sampai produksi', data.alur) +
        renderLajur('peta', 'Data peta: dari berkas sampai tampilan', data.peta) +
        `<footer class="hud-detail" role="status" aria-live="polite">${DETAIL_AWAL}</footer>`;

    const cariSkill = (lajur, tahap, nama) => data[lajur].find(t => t.id === tahap).skills.find(x => x.n === nama);

    hud.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip[data-skill]');
        const simpul = e.target.closest('.hud-node');
        const lane = e.target.closest('.hud-lanebtn');
        if (chip) {
            hud.querySelectorAll('.chip[aria-pressed="true"]').forEach(c => c.setAttribute('aria-pressed', 'false'));
            chip.setAttribute('aria-pressed', 'true');
            tampilkanBukti(hud, cariSkill(chip.dataset.lajur, chip.dataset.tahap, chip.dataset.skill), data);
        } else if (simpul) {
            const lajur = simpul.closest('.hud-lane');
            lajur.querySelectorAll('.hud-node, .hud-stage').forEach(el => el.classList.toggle('is-aktif', el.dataset.tahap === simpul.dataset.tahap));
            lajur.querySelectorAll('.hud-node').forEach(el => el.setAttribute('aria-pressed', String(el === simpul)));
        } else if (lane) {
            hud.querySelectorAll('.hud-lanebtn, .hud-lane').forEach(el => el.classList.toggle('is-aktif', (el.dataset.lajur) === lane.dataset.lajur));
        }
    });
    return hud;
}

function tampilkanBukti(hud, sk, data) {
    const kotak = hud.querySelector('.hud-detail');
    const bagian = [`<strong>${esc(sk.n)}</strong>`];
    if (sk.a.length) {
        const daftar = sk.a.slice(0, 3).map(a => `<a href="/blog/${esc(a.id)}/">${esc(a.t)}</a>`).join(' &middot; ');
        const semua = sk.tag ? ` &middot; <a href="/blog/tag/${esc(sk.tag)}/">semua artikel &rarr;</a>` : '';
        bagian.push(`${sk.a.length} artikel: ${daftar}${semua}`);
    }
    if (sk.p.length) {
        bagian.push('proyek: ' + sk.p.map(n => `<a href="${esc(data.proyek[n])}" target="_blank" rel="noopener noreferrer">${esc(n)}</a>`).join(', '));
    }
    kotak.innerHTML = bagian.join(' &mdash; ');
}

async function bukaSkills() {
    clearTypingTimeouts();
    sembunyikanTab();
    const terminal = document.querySelector('.terminal');
    if (!terminal) return;
    let hud = document.getElementById('skill-hud');
    if (!hud) {
        hud = buatHud(await muatSkill());
        terminal.insertAdjacentElement('afterend', hud);
    }
    terminal.hidden = true;
    hud.hidden = false;
    hud.classList.remove('is-masuk');
    void hud.offsetWidth; // ulang animasi masuk
    hud.classList.add('is-masuk');
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
