// VERIFICAR A COOKIE DE SESSÃO ATIVO
var cookies = document.cookie.split(';');
var usuarioLogado = null;
for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.startsWith("usuarioLogado=")) {
        usuarioLogado = JSON.parse(cookie.substring("usuarioLogado=".length, cookie.length));
        break;
    }
}

// FUNÇÃO USUÁRIO NÃO LOGADO
if (!usuarioLogado) {
    window.location.href = "../login/login.html";
}

document.addEventListener("DOMContentLoaded", function() {

    var emailUsuario = usuarioLogado.email;
    document.getElementById("nomeUsuario").textContent = emailUsuario; 

    // EVENTO DE CLICK BOTÂO SAIR
    document.getElementById("logoutBtn").addEventListener("click", encerrarSessao);

    preencherDivClientes()
});

// FUNÇÃO PREENCHER CLIENTES CARDS
function preencherDivClientes() {
    alasql.promise('SELECT * FROM clientes')
    .then(function(clientes) {
        var divClientes = document.getElementById('divClientes');
        divClientes.innerHTML = '';

        if(clientes.length === 0) {
            divClientes.innerHTML = 'Nenhum cliente cadastrado no sistema.';
        } else {
            clientes.forEach(function(cliente) {
                var imagemSrc = cliente.sexo === 'masculino' ? '../home/imgClientes/men.png' : '../home/imgClientes/woman.png';
                var cardHtml = `
                    <div class="col-md-4 col-sm-6">
                        <a href="#" style="text-decoration: none; color: inherit;">
                            <div class="card" style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);">
                                <img src="${imagemSrc}" class="card-img-top img-fluid" alt="..." style="height: 300px; object-fit: cover;">
                                <div class="card-body">
                                    <h5 class="card-title">${cliente.nome}</h5>
                                    <p class="card-text" style="margin-bottom: 5%;">${cliente.nome}, desenvolvedor full-stack da empresa AGROSYS.</p>
                                    <button href="#" data-cliente-id="${cliente.id}" class="btn btn-primary d-flex justify-content-between align-items-center btn-exibir-cliente">
                                        <span>EXIBIR INFORMAÇÕES</span>
                                        <i class="fas fa-arrow-right" style="margin-left: 5px; font-size: 1rem;"></i>
                                    </button>                            
                                </div>
                            </div>
                        </a>
                    </div>
                `;
                divClientes.innerHTML += cardHtml;
            });

            // EVENTO DE CLICK EXIBIR INFORMAÇÕES CLIENTE CARD
            divClientes.querySelectorAll('.btn-exibir-cliente').forEach(function(button, index) {
                button.addEventListener('click', function() {
                    var modalClienteBody = document.getElementById('modalClienteBody');
                    modalClienteBody.innerHTML = ''; 

                    var cliente = clientes[index];
                    var informacoesCliente = `
                        <p>Nome: ${cliente.nome}</p>
                        <p>CPF: ${cliente.cpf}</p>
                        <p>Data de Nascimento: ${cliente.data_nascimento}</p>
                        <p>Telefone: ${cliente.telefone}</p>
                        <p>Celular: ${cliente.celular}</p>
                        <p>Sexo: ${cliente.sexo}</p>
                    `;
                    modalClienteBody.innerHTML = informacoesCliente;

                    var modalCliente = new bootstrap.Modal(document.getElementById('modalCliente'));
                    modalCliente.show();
                });
            });
        }
    })
    .catch(function(error) {
        console.error("Erro ao preencher div de clientes:", error);
    });
}

// FUNÇÃO DE LOGOUT
function encerrarSessao() {
    // Define a data de expiração do cookie para uma data no passado
    document.cookie = 'usuarioLogado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = "../login/login.html";
}

// STYLES FOCUS INPUTS
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

// FUNÇÃO CRIPTOGRAFAR SENHAS
function encryptPassword(password) {
    const salt = CryptoJS.lib.WordArray.random(16);

    const hash = CryptoJS.PBKDF2(password, salt, { keySize: 512/32, iterations: 1000 });

    const saltString = CryptoJS.enc.Base64.stringify(salt);
    const hashString = CryptoJS.enc.Base64.stringify(hash);

    return saltString + ":" + hashString;
}

// FUNÇÕES EXECUTADAS QUANDO A PÁGINA CARREGA
document.addEventListener("DOMContentLoaded", function() {
    
    // FUNÇÃO SALVAR NOVO EMAIL
    document.getElementById("btnSalvarAlteracoes").addEventListener("click", async function() {
        var usuarioLogado = getCookie("usuarioLogado");

        if (usuarioLogado) {
            var usuario = JSON.parse(usuarioLogado);
            var senhaUsuario = document.getElementById("senhaUsuario").value;
            var novoEmail = document.getElementById("novoEmail").value;
            var idUsuario = usuario.id;

            if (verificarSenha(senhaUsuario, usuario.senha)) {
                if (novoEmail !== usuario.email) {
                    var sql = `UPDATE usuarios SET email = ? WHERE id = ?`;
                
                    alasql(sql, [novoEmail, idUsuario]);
                                
                    usuario.email = novoEmail;
                    document.cookie = `usuarioLogado=${JSON.stringify(usuario)}; path=/`;
                
                    alert("Email atualizado com sucesso!");
                    window.location.href = "../home/home.html";
                    return;
                } else {
                    alert("O novo email deve ser diferente do seu próprio email.");
                    return;
                }
            } else {
                alert("Senha incorreta! Por favor, verifique a senha.");
                return;
            }
        } else {
            console.error("Cookie usuarioLogado não encontrado.");
        }
    });

    // FUNÇÃO SALVAR NOVA SENHA
    document.getElementById("btnSalvar").addEventListener("click", async function() {
        var usuarioLogado = getCookie("usuarioLogado");

        if(usuarioLogado) {
            var usuario = JSON.parse(usuarioLogado);
            var novaSenha = document.getElementById("novaSenha").value;
            var confirmarNovaSenha = document.getElementById("confirmarNovaSenha").value;
            var senhaAtual = document.getElementById("senha").value;

            if(novaSenha == confirmarNovaSenha) {
                if(verificarSenha(senhaAtual, usuario.senha)) {

                    var senhaCriptografada = encryptPassword(novaSenha);

                    var sqlUpdateSenha = `UPDATE usuarios SET senha = ? WHERE id = ?`;
                    alasql(sqlUpdateSenha, [senhaCriptografada, usuario.id]);

                    usuario.senha = senhaCriptografada;
                    document.cookie = `usuarioLogado=${JSON.stringify(usuario)}; path=/`;

                    alert("Senha atualizada com sucesso!");
                    window.location.href = "../home/home.html";
                    return;
                } else {
                    alert("Senha incorreta! Por favor, insira uma senha válida!");
                }
            }else {
                alert("As senhas não coincidem. Por favor, verifique as senhas.");
                return;
            }
        } else {
            console.error("Cookie usuarioLogado não encontrado.");
        }
    });

    // COLETA OS COOKIES DO USUÁRIO
    function getCookie(name) {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                return decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
        return null;
    }
});
