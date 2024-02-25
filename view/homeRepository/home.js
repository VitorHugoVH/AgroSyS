// Verificar se existe um cookie de sessão ativo
var cookies = document.cookie.split(';');
var usuarioLogado = null;
for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.startsWith("usuarioLogado=")) {
        usuarioLogado = JSON.parse(cookie.substring("usuarioLogado=".length, cookie.length));
        break;
    }
}

// Se não houver usuário logado, redirecione para a página de login
if (!usuarioLogado) {
    window.location.href = "../login/login.html";
}

document.addEventListener("DOMContentLoaded", function() {
    // Exibir mensagem de boas-vindas e configurar o botão de logout
    const alertSuccess = document.getElementById("alertSuccess");
    alertSuccess.style.display = "block";
    timeOutAlerts(alertSuccess);

    //var nomeUsuario = usuarioLogado.nome; 
    var emailUsuario = usuarioLogado.email;
    document.getElementById("nomeUsuario").textContent = emailUsuario; 

    // Evento de clique no botão de logout
    document.getElementById("logoutBtn").addEventListener("click", encerrarSessao);
});

// TIMEOUT DOS ALERTAS
function timeOutAlerts(alert) {
    setTimeout(() => {
        alert.style.display = "none";
    }, 3000);
}

// FUNÇÃO DE LOGOUT
function encerrarSessao() {
    // Define a data de expiração do cookie para uma data no passado
    document.cookie = 'usuarioLogado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = "../login/login.html";
}

// STYLES FOCUS
function colorTransformation(param, isFocus) {
    const backgroundColor = isFocus ? "red" : "white";
    const textColor = isFocus ? "white" : "black";

    if (param === 'logout') {
        document.getElementById("logoutItem").style.backgroundColor = backgroundColor;
        document.getElementById("logoutBtn").style.backgroundColor = backgroundColor;
        document.getElementById("logoutText").style.color = textColor;
    }
}

// FUNÇÃO PARA VERIFICAR SENHAS
function verificarSenha(senhaUsuario, senhaArmazenada) {
    const [storedSalt, storedHash] = senhaArmazenada.split(":");
    const hash = CryptoJS.PBKDF2(senhaUsuario, CryptoJS.enc.Base64.parse(storedSalt), { keySize: 512/32, iterations: 1000 }).toString(CryptoJS.enc.Base64);
    return hash === storedHash;
}

// FUNÇÃO PARA VERIFICAR EMAILS EXISTENTES
async function verificarEmailExistentes(email) {
    var usuarioCadastrado = await alasql.promise('SELECT * FROM usuarios WHERE email = ?', [email]);
    return usuarioCadastrado.length > 0;
}

// Função para criptografar a senha
function encryptPassword(password) {
    const salt = CryptoJS.lib.WordArray.random(16);

    const hash = CryptoJS.PBKDF2(password, salt, { keySize: 512/32, iterations: 1000 });

    const saltString = CryptoJS.enc.Base64.stringify(salt);
    const hashString = CryptoJS.enc.Base64.stringify(hash);

    return saltString + ":" + hashString;
}
