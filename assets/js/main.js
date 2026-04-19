// assets/js/main.js - Lógica visual do Front-end
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('glap_token');
    const usuario = localStorage.getItem('glap_user');
    const menu = document.querySelector('.menu');

    // Verifica se os dados de login existem no navegador
    if (token && usuario && menu) {
        const loginLink = menu.querySelector('a[href*="login.html"]');
        if (loginLink) {
            const li = loginLink.parentElement;
            li.innerHTML = `
                <div style="color: white; font-size: 0.85rem; text-align: center; border-left: 1px solid #444; padding-left: 10px;">
                    <span style="display: block; font-weight: bold;">Olá, ${usuario.split(' ')[0]}</span>
                    <a href="#" id="logout-btn" style="color: #ff6b6b; font-size: 0.75rem; text-decoration: none;">(Sair)</a>
                </div>
            `;

            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('glap_token');
                localStorage.removeItem('glap_user');
                window.location.href = '/index.html'; // Volta para a home ao sair
            });
        }
    }
});