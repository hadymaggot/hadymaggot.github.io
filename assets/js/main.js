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
            case 'home':
                command = 'whoami && cat about.txt';
                output = `
                        <pre class="profile-info">Ahadizapto - Web Developer | DevOps Engineer | Security Operations</pre>
                        <p>Welcome to my digital workspace! I'm a passionate technologist specializing in web
                            development, DevOps automation, and security operations.</p>
                        <p>With a strong foundation in infrastructure as code and CI/CD pipelines, I help organizations
                            build secure, scalable, and resilient systems.</p>
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