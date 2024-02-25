// IMPORTANDO A BIBLIOTECA CRYPTO
var script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
document.body.appendChild(script);

// CRIAR COOKIE DE SESSÃO DO USUÁRIO
function iniciarSessao(usuario, lembrarMe) {
    if (lembrarMe) {
        var dataExpiracao = new Date();
        dataExpiracao.setDate(dataExpiracao.getDate() + 7);
        var cookieValor = JSON.stringify(usuario) + "; expires=" + dataExpiracao.toUTCString();
        document.cookie = `usuarioLogado=${cookieValor}; path=/`;
    } else {
        document.cookie = `usuarioLogado=${JSON.stringify(usuario)}; path=/`;
    }
}

// Função para verificar a senha durante o login
function verificarSenha(senhaUsuario, senhaArmazenada) {
    const [storedSalt, storedHash] = senhaArmazenada.split(":");
    const hash = CryptoJS.PBKDF2(senhaUsuario, CryptoJS.enc.Base64.parse(storedSalt), { keySize: 512/32, iterations: 1000 }).toString(CryptoJS.enc.Base64);
    return hash === storedHash;
}

// Função para verificar as credenciais do usuário
function verificarUsuario(emailUsuario, senhaUsuario, lembrarMe) {
    try {
        const user = alasql('SELECT * FROM usuarios WHERE email = ?', [emailUsuario])[0];

        if (user && verificarSenha(senhaUsuario, user.senha)) {
            iniciarSessao(user, lembrarMe);
            window.location.href = "../home/home.html";
        } else {
            alert("Email ou senha incorretos. Por favor, tente novamente.");
            window.location.href = "../login/login.html";
        }
    } catch {
        alert("Erro ao fazer login. Por favor, tente novamente.");
    }
}

// ENCERRAR SESSÃO
function encerrarSessao() {
    document.cookie = 'usuarioLogado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = "../login/login.html";
}