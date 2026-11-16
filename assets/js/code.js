// Blok kode pada halaman artikel: penyorotan sintaks (highlight.js, dihost sendiri) dan tombol salin.
// Bahasa diambil dari kelas language-* pada <code>; bila tidak ada, bahasa dideteksi otomatis dari subset di bawah.
(function () {
    'use strict';

    var blocks = document.querySelectorAll('.post-body pre > code');
    if (!blocks.length) return;

    var AUTO_SUBSET = ['bash', 'sql', 'python', 'javascript', 'typescript', 'php', 'json', 'yaml', 'ini', 'xml',
        'css', 'diff', 'powershell', 'dockerfile'];
    var LABEL = {
        bash: 'Bash', sh: 'Shell', shell: 'Shell', sql: 'SQL', python: 'Python', py: 'Python',
        javascript: 'JavaScript', js: 'JavaScript', typescript: 'TypeScript', ts: 'TypeScript', php: 'PHP',
        json: 'JSON', yaml: 'YAML', yml: 'YAML', ini: 'INI', xml: 'XML', html: 'HTML', css: 'CSS', diff: 'Diff',
        powershell: 'PowerShell', dockerfile: 'Dockerfile', plaintext: 'Teks'
    };

    function languageOf(code) {
        var m = /(?:^|\s)language-([\w+-]+)/.exec(code.className);
        return m ? m[1].toLowerCase() : '';
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            try {
                if (document.execCommand('copy')) resolve(); else reject(new Error('copy gagal'));
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(area);
            }
        });
    }

    blocks.forEach(function (code) {
        var pre = code.parentElement;
        var lang = languageOf(code);
        var raw = code.textContent;

        if (window.hljs) {
            if (lang && lang !== 'plaintext' && window.hljs.getLanguage(lang)) {
                window.hljs.highlightElement(code);
            } else if (!lang) {
                var result = window.hljs.highlightAuto(raw, AUTO_SUBSET);
                code.innerHTML = result.value;
                code.classList.add('hljs');
                lang = result.language || '';
            }
        }

        var wrap = document.createElement('div');
        wrap.className = 'code-block';
        var head = document.createElement('div');
        head.className = 'code-head';
        var label = document.createElement('span');
        label.textContent = LABEL[lang] || (lang ? lang : 'Kode');
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-copy';
        button.textContent = 'Salin';
        button.setAttribute('aria-label', 'Salin kode ' + label.textContent);

        var timer = null;
        button.addEventListener('click', function () {
            copyText(raw).then(function () {
                button.textContent = 'Disalin';
            }, function () {
                button.textContent = 'Gagal';
            }).then(function () {
                clearTimeout(timer);
                timer = setTimeout(function () { button.textContent = 'Salin'; }, 1600);
            });
        });

        head.appendChild(label);
        head.appendChild(button);
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(head);
        wrap.appendChild(pre);
    });
})();
