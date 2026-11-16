
// Array teks untuk ticker
const tickerTexts = [
    "Web Developer",
    "DevOps Engineer", 
    "Security Operations"
];

let currentIndex = 0;

function updateTitle() {
    document.title = `Ahadizapto | ${tickerTexts[currentIndex]}`;
    currentIndex = (currentIndex + 1) % tickerTexts.length;
}

// Update judul setiap 3 detik
setInterval(updateTitle, 3000);

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
                output = `<p>Halo, saya Sapto Hadi (Ahadizapto). Saya bekerja di irisan cybersecurity dan operations:
                            membangun sistem yang aman, mudah dioperasikan, dan bisa diaudit.</p>
                        <p><strong>Security</strong> &mdash; menguji aplikasi web secara terukur (access control, kebocoran data
                            di sisi klien, header dan TLS, dependensi rentan), lalu mengubah temuan pentest menjadi test otomatis
                            yang berjalan terus di CI.</p>
                        <p><strong>Ops</strong> &mdash; container dan Kubernetes, infrastructure as code, CI/CD, serta monitoring
                            dan observability dengan prinsip SRE.</p>
                        <p><strong>Dev</strong> &mdash; aplikasi web dengan PHP/Laravel dan Vue, serta Python untuk otomasi.</p>
                        <p>Pengujian keamanan hanya dilakukan pada sistem milik sendiri atau dengan izin tertulis.</p>`;
                break;
            case 'skills':
                command = 'ls -la skills/';
                const skillGroups = {
                    'security/': ["Penetration Testing", "SIEM", "OWASP ZAP", "Trivy", "Semgrep", "Gitleaks", "Nmap"],
                    'ops/': ["Linux", "Docker", "Kubernetes", "Ansible", "Monitoring", "SRE", "Bash", "Git", "GitHub Actions"],
                    'dev/': ["PHP", "Laravel", "VueJS", "Python"]
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
                    { name: '9hs-ubuntu-fancyprompt', url: 'https://github.com/hadymaggot/9hs-ubuntu-fancyprompt', tag: 'ops',
                      desc: 'Prompt shell Ubuntu yang informatif.' }
                ];
                const wrtProjects = [
                    { name: 'sistem-tata-kelola-regulasi', stack: 'TypeScript', desc: 'Sistem informasi tata kelola regulasi.' },
                    { name: 'aplikasi-emisi-ketenagalistrikan', stack: 'PHP', desc: 'Penghitungan dan pelaporan emisi ketenagalistrikan.' },
                    { name: 'sistem-ikpa', stack: 'PHP (CodeIgniter 4), JavaScript', desc: 'Indikator kinerja pelaksanaan anggaran (IKPA): aplikasi dan API integrasi.' },
                    { name: 'dashboard-smart-mett', stack: 'Python', desc: 'Dashboard SMART dan METT untuk aplikasi pemantauan.' },
                    { name: 'importir-wrt', stack: 'Python', desc: 'Engine katalog dataset dinamis, beserta penerbit dan pemvalidasi lisensinya.' },
                    { name: 'titip-absen', stack: 'TypeScript', desc: 'Absensi personil proyek.' },
                    { name: 'wrt-compro', stack: 'JavaScript', desc: 'Company profile Wahana Reka Tekindo.' },
                    { name: 'wrt-web-api', stack: 'PHP', desc: 'Situs dan API Wahana Reka Tekindo, termasuk situs demo.' },
                    { name: 'wrt-filamentz', stack: 'Filament', desc: 'Aplikasi web berbasis Filament.' },
                    { name: 'wrt-template', stack: 'Blade', desc: 'Template dasar aplikasi web.' },
                    { name: 'platform-bumdes-frontend', stack: 'Frontend', desc: 'Antarmuka platform BUMDes.' },
                    { name: 'koperasi-digital', stack: 'TypeScript', desc: 'Platform koperasi digital.' }
                ];
                const otherProjects = [
                    { name: 'sirus-2022', stack: 'PHP', desc: 'Sistem Informasi Rumah Swadaya (SIRUS).' },
                    { name: 'bsps-api', stack: 'Laravel', desc: 'API Laravel untuk bantuan stimulan perumahan swadaya (BSPS), dengan koleksi Postman.' },
                    { name: 'sisatker', stack: 'CodeIgniter', desc: 'Aplikasi web CodeIgniter dengan template Stisla.' },
                    { name: 'stantek', stack: 'CodeIgniter', desc: 'Aplikasi web CodeIgniter dengan template Stisla.' }
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
                    `</ul><p>Perusahaan:<a class="term-link" href="https://wahanarekatekindo.co.id" target="_blank" rel="noopener noreferrer">wahanarekatekindo.co.id</a></p>` +
                    `<p>Selengkapnya: <a class="term-link" href="https://github.com/hadymaggot/" target="_blank" rel="noopener noreferrer">github.com/hadymaggot</a></p>`;
                break;
            case 'blog':
                command = 'cd /blog && ls -la';
                output = `<p>Exploring my thoughts and technical experiences...</p>
                    <p>Visit the full blog at: <a href="/blog.html" 
                        style="color: var(--primary-color); text-decoration: none; border-bottom: 1px dotted var(--primary-color);"
                        onmouseover="this.style.color='var(--secondary-color)'"
                        onmouseout="this.style.color='var(--primary-color)'">blog.html</a></p>`;
                break;
            case 'contact':
                command = 'find . -type f -name "contact_info"';
                output = `./contact/<a class="term-link" href="mailto:saptohadi@outlook.com">email.txt</a>
                    ./social/<a class="term-link" href="https://github.com/hadymaggot/" target="_blank" rel="noopener noreferrer">github.com</a>
                    ./social/<a class="term-link" href="https://www.linkedin.com/in/saptohadi/" target="_blank" rel="noopener noreferrer">linkedin.com</a>
                    ./social/<a class="term-link" href="https://x.com/hadymaggot/" target="_blank" rel="noopener noreferrer">x.com</a>
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
                            Web Developer | DevOps Engineer | Security Operations
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
