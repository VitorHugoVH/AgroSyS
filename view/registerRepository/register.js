// CADASTRAR NOVO USUÁRIO
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("enviarBtn").addEventListener("click", function(event) {
        event.preventDefault(); 

        var nome = document.getElementById("nomeUsuario").value;
        var email = document.getElementById("emailUsuario").value;
        var senha = document.getElementById("senhaUsuarioRegister").value;
        var confirmacaoSenha = document.getElementById("confirmacaoSenhaUsuarioRegister").value;

        if (senha !== confirmacaoSenha) {
            alert("As senhas não coincidem. Por favor, verique as senhas.");
            return;
        } else {
            const senhaCriptografada = encryptPassword(senha);
            inserirUsuario(nome, email, senhaCriptografada);
        }
    });
});

// FUNÇÃO CRIPTOGRAFAR SENHA
function encryptPassword(password) {
    const salt = CryptoJS.lib.WordArray.random(16);

    const hash = CryptoJS.PBKDF2(password, salt, { keySize: 512/32, iterations: 1000 });

    const saltString = CryptoJS.enc.Base64.stringify(salt);
    const hashString = CryptoJS.enc.Base64.stringify(hash);

    return saltString + ":" + hashString;
}

// CADASTRAR NOVO USUÁRIO
function inserirUsuario(nome, email, senha) {
    try {
        var usuarioCadastrado = alasql('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (usuarioCadastrado.length > 0) {
            alert("Email já cadastrado. Por favor insira um novo email.");
            return;
        } else {
            alasql('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha]);
            alert("Usuário criado com sucesso!");
            window.location.href = "../login/login.html";
        }
    } catch (error) {
        alert("Erro ao cadastrar usuário. Por favor, tente novamente.");
        return;
    }
}
