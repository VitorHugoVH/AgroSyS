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
