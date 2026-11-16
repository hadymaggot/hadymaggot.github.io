

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

        switch(target) {
            case 'about':
                command = 'cat about.txt';
                output = `<p>Saya Sapto Hadi (Ahadizapto), engineer di bidang security dan operations. Fokus saya pada pengujian
                            keamanan aplikasi web, pengelolaan infrastruktur berbasis container, dan otomasi pipeline CI/CD.</p>
                        <p>Pengujian keamanan mencakup access control, kebocoran data di sisi client, header dan TLS, serta dependency
                            yang memiliki CVE. Setiap temuan dijadikan test otomatis, sehingga celah yang sama terdeteksi jika muncul
                            kembali.</p>
                        <p>Di sisi operations, pekerjaan saya meliputi container dan Kubernetes, infrastructure as code, serta monitoring
                            dan observability.</p>
                        <p>Di bidang GIS, pekerjaan saya mencakup pengolahan data spasial (GeoJSON, shapefile, PostGIS) dan aplikasi peta
                            interaktif dengan MapLibre, Leaflet, dan OpenLayers, termasuk pengelolaan basemap tile dan kode wilayah administrasi.</p>
                        <p>Bahasa yang saya pakai adalah PHP, JavaScript dan TypeScript, Python, SQL, serta Bash, dengan Laravel dan Vue
                            sebagai framework utama.</p>
                        <p>Catatan teknis dari pekerjaan sehari-hari terbit di blog, mencakup security, operations, dan GIS.</p>
                        <p>Pengujian keamanan hanya dilakukan pada sistem milik sendiri atau dengan izin tertulis.</p>`;
                break;
            case 'skills':
                command = 'ls -la skills/';
                const skillGroups = {
                    'security/': ["Penetration Testing", "SIEM", "OWASP ZAP", "Trivy", "Semgrep", "Gitleaks", "Nmap"],
                    'ops/': ["Linux", "Docker", "Docker Compose", "Kubernetes", "Ansible", "Traefik", "Redis", "RabbitMQ", "PostgreSQL", "MySQL", "Prometheus", "Grafana", "Cloudflare", "Monitoring", "SRE", "Git", "GitHub Actions"],
                    'gis/': ["GeoJSON", "Shapefile", "PostGIS", "MapLibre GL", "Leaflet", "OpenLayers", "Turf.js", "proj4", "Tile XYZ/WMS"],
                    'dev/': ["PHP", "Laravel", "JavaScript", "TypeScript", "VueJS", "Python", "SQL", "Bash", "PowerShell", "R", "Django", "Quasar", "Playwright"]
                };
                output = `total ${Object.keys(skillGroups).length}` +
                    Object.entries(skillGroups).map(([group, list]) =>
                        `<div>drwxr-xr-x ${group}</div><div class="skill-list">` +
                        list.map(skill => `<span class="skill-tag">${skill}</span>`).join('') +
                        `</div>`
                    ).join('');
                break;
            case 'projects':
                command = 'ls -la projects/';
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
                const otherProjects = [
                    { name: 'sirus-2022', stack: 'PHP', desc: 'Sistem Informasi Rumah Swadaya (SIRUS).' },
                    { name: 'bsps-api', stack: 'Laravel', desc: 'API Laravel untuk bantuan stimulan perumahan swadaya (BSPS), dengan koleksi Postman.' },
                    { name: 'sisatker', stack: 'CodeIgniter', desc: 'Aplikasi web CodeIgniter dengan template Stisla.' },
                    { name: 'stantek', stack: 'CodeIgniter', desc: 'Aplikasi web CodeIgniter dengan template Stisla.' },
                    { name: 'aplikasi-web-skala-besar', stack: 'PHP, Vue', desc: 'Aplikasi web dengan kode dasar besar dan banyak kontributor, sekitar 300 commit saya di dalamnya.' },
                    { name: 'platform-webgis', stack: 'JavaScript, Vue', desc: 'Platform WebGIS dengan engine peta kustom: layer, proyeksi, dan pengolahan shapefile.' }
                ];
                output = `total ${projects.length + wrtProjects.length + otherProjects.length}<ul class="project-list">` +
                    projects.map(p => `<li><a class="term-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.name}</a>
                        <span class="project-tag project-tag-${p.tag}">${p.tag}</span><br>${p.desc}</li>`).join('') +
                    `</ul><div>drwxr-xr-x wahana-reka-tekindo/ (repo privat, tanpa tautan)</div><ul class="project-list">` +
                    wrtProjects.map(p => `<li>${p.name}
                        <span class="project-tag project-tag-private">${p.stack}</span><br>${p.desc}</li>`).join('') +
                    `</ul><div>drwxr-xr-x lainnya/ (repo privat, tanpa tautan)</div><ul class="project-list">` +
                    otherProjects.map(p => `<li>${p.name}
                        <span class="project-tag project-tag-private">${p.stack}</span><br>${p.desc}</li>`).join('') +
                    `</ul><p>Perusahaan: <a class="term-link" href="https://wahanarekatekindo.co.id" target="_blank" rel="noopener noreferrer">wahanarekatekindo.co.id</a></p>` +
                    `<p>Selengkapnya: <a class="term-link" href="https://github.com/hadymaggot/" target="_blank" rel="noopener noreferrer">github.com/hadymaggot</a></p>`;
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
                ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝        ╚═╝    ╚═════╝ 
                            Security | Operations | GIS
                </pre>`;
                break;
            case 'ahadizapto':
                command = 'history | grep "http" | sort | uniq -c | sort -nr | head -n 5';
                output = `
                        86 <a href="https://ahadizapto.tech" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">ahadizapto.tech</a>
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

        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.innerHTML = `
            <div class="command-line">
                <span class="prompt">ahadi@zapto:~$</span>
                <span class="command" id="typing-nav"></span>
            </div>
        `;

        // Typing effect for navigation commands
        let i = 0;
        const typingElement = document.getElementById('typing-nav');
        

// Typing effect for navigation commands
function typeNavCommand() {
    if (i < command.length) {
        typingElement.innerHTML = command.substring(0, i + 1) + '<span class="blink">█</span>';
        i++;
        currentTypingTimeout = setTimeout(typeNavCommand, Math.random() * 100 + 50);
    } else {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'output';
        outputDiv.innerHTML = output;
        terminalContent.appendChild(outputDiv);
    }
}
        typeNavCommand();
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
