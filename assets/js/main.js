// Typing effect
const commands = [
    "kubectl get pods --all-namespaces",
    "terraform apply -auto-approve",
    "docker-compose up -d",
    "sudo rm -rf /",
    "nmap -sS -sV --script vuln target.com",
    "aws ec2 describe-instances",
    "tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn) != 0'",
    "netstat -n | grep SYN_RECV | wc -l",
    "fail2ban-client status",
    "waf-log-analysis.sh | grep 'HTTP flood'",
    "iptables -L INPUT | grep DROP"
];
let currentCommand = 0;
let i = 0;
const typingElement = document.getElementById("typing");

function typeWriter() {
    if (i < commands[currentCommand].length) {
        typingElement.textContent += commands[currentCommand].charAt(i);
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

setTimeout(typeWriter, 1000);

// Add event listeners for navigation links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('href').substring(1);
        let command = '';
        let output = '';

        switch(target) {
            case 'about':
                command = 'cat about.txt';
                output = `<p>Welcome to my digital workspace! I'm a passionate technologist specializing in web
                            development, DevOps automation, and security operations.</p>
                        <p>With a strong foundation in infrastructure as code and CI/CD pipelines, I help organizations
                            build secure, scalable, and resilient systems.</p>`;
                break;
            case 'skills':
                command = 'ls -la skills/';
                const skills = [
                    "Kubernetes", "Docker", "Linux", "Python", 
                    "Git", "Ansible", "Monitoring", 
                    "Penetration Testing", "SIEM"
                ];
                output = `total ${skills.length}\n` + 
                    `<div class="skill-list">` +
                    skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('') +
                    `</div>`;
                break;
            case 'projects':
                command = 'ls -la projects/';
                output = 'Coming soon...';
                break;
            case 'contact':
                command = 'find . -type f -name "contact_info"';
                output = `./contact/<a href="mailto:saptohadi@outlook.com" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">email.txt</a>
                    ./social/<a href="https://github.com/hadymaggot/" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">github.com</a>
                    ./social/<a href="https://www.linkedin.com/in/saptohadi/" target="_blank"
                        style="color: inherit; text-decoration: none; border-bottom: none;"
                        onmouseover="this.style.borderBottom='1px dotted #fff'"
                        onmouseout="this.style.borderBottom='none'">linkedin.com</a>`;
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
                <span class="command" id="typing-nav"></span><span class="blink">█</span>
            </div>
        `;

        // Typing effect for navigation commands
        let i = 0;
        const typingElement = document.getElementById('typing-nav');
        function typeNavCommand() {
            if (i < command.length) {
                typingElement.textContent += command.charAt(i);
                i++;
                setTimeout(typeNavCommand, Math.random() * 100 + 50);
            } else {
                // Add output after typing completes
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
        body.style.overflow = 'hidden'; // Mencegah scroll saat menu terbuka
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        body.style.overflow = ''; // Mengembalikan scroll
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
const CACHE_EXPIRATION = 3600000; // 1 hour

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
                const city = data.address.city || data.address.town || data.address.village;
                cachedLocation = {
                    value: city,
                    timestamp: Date.now()
                };
                document.getElementById('user-location').textContent = cachedLocation.value;
            }, null, {
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
