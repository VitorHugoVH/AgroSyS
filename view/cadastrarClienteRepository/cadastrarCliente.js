// CADASTRAR NOVO CLIENTE
function inserirCliente(nomeCliente, cpfCliente, nascimentoCliente, telefoneCliente, celularCliente, sexoCliente) {
    try {
        var clienteCadastrado = alasql('SELECT * FROM clientes WHERE cpf = ?', [cpfCliente]);

        if (clienteCadastrado.length > 0) {
            alert("CPF já cadastrado Por favor, insira um novo cpf.");
            return;
        } else {
            alasql('INSERT INTO clientes (nome, cpf, data_nascimento, telefone, celular, sexo) VALUES (?, ?, ?, ?, ?, ?)',
            [nomeCliente, cpfCliente, nascimentoCliente, telefoneCliente, celularCliente, sexoCliente]);

            alert("Cliente cadastado com sucesso!");
            window.location.href = "../cadastrarCliente/cadastrarCliente.html";
        }
    } catch (error) {
        alert("Erro ao cadastrar cliente. Por favor, tente novamente.");
        return;
    }
}

// DELETAR CLIENTE TABELA 
function deletarCliente(clienteId) {
    alasql.promise('DELETE FROM clientes WHERE id = ' + clienteId)
    .then(function () {
        var rowToRemove = document.querySelector(`tr[data-cliente-id="${clienteId}"]`);
        rowToRemove.remove();
        alert("Cliente deletado com sucesso!");
    })
    .catch(function (error) {
        console.error("Erro ao deletar cliente:", error);
        alert("Erro ao deletar cliente. Por favor, tente novamente.");
    });
}

// FUNÇÃO PESQUISAR
document.getElementById("btnPesquisar").addEventListener("click", async function(){
    var termoPesquisa = document.getElementById("termoPesquisa").value;

    if(termoPesquisa != null) {
        preencherTabelaClientes(termoPesquisa);
    }
});

function preencherTabelaClientes(termoPesquisa) {
    var sql = 'SELECT * FROM clientes';

    if (termoPesquisa) {
        sql = `SELECT * FROM clientes WHERE nome LIKE '%${termoPesquisa}%'`;
    }

    alasql.promise(sql)
    .then(function(clientes) {
        var tabelaBody = document.getElementById('tabelaClientesBody');
        tabelaBody.innerHTML = ''; 

        if (clientes.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="8">Nenhum resultado encontrado</td></tr>';
        } else {
            clientes.forEach(function(cliente) {
                var row = document.createElement('tr');
                row.setAttribute('data-cliente-id', cliente.id);

                row.innerHTML = `
                    <td style="white-space: nowrap;">${cliente.id}</td>
                    <td style="white-space: nowrap;">${cliente.nome}</td>
                    <td style="white-space: nowrap;">${cliente.cpf}</td>
                    <td style="white-space: nowrap;">${cliente.data_nascimento}</td>
                    <td style="white-space: nowrap;">${cliente.telefone}</td>
                    <td style="white-space: nowrap;">${cliente.celular}</td>
                    <td style="white-space: nowrap;">${cliente.sexo}</td>
                    <td style="white-space: nowrap;">
                        <button class="btn btn-danger btn-deletar"><i class="fas fa-trash"></i></button> 
                        <button class="btn btn-primary btn-editar"><i class="fas fa-edit"></i></button>
                        </td>
                `;
                tabelaBody.appendChild(row);
            });

            // FUNÇÃO CLIQUE BOTÃO EDITAR
            tabelaClientesBody.querySelectorAll('.btn-editar').forEach(function(button) {
                button.addEventListener('click', function() {
                    var row = button.closest('tr');
                    
                    var id = row.cells[0].textContent.trim();
                    var nome = row.cells[1].textContent.trim();
                    var cpf = row.cells[2].textContent.trim();
                    var nascimento = row.cells[3].textContent.trim();
                    var telefone = row.cells[4].textContent.trim();
                    var celular = row.cells[5].textContent.trim();
                    var sexo = row.cells[6].textContent.trim();

                    document.getElementById('nomeClienteEdit').value = nome;
                    document.getElementById('cpfClienteEdit').value = cpf;
                    document.getElementById('nascimentoClienteEdit').value = nascimento;
                    document.getElementById('telefoneClienteEdit').value = telefone;
                    document.getElementById('celularClienteEdit').value = celular;
                    document.getElementById('idClienteEdit').value = id;

                    var selectSexo = document.getElementById('sexoClienteEdit');
                    if (sexo === 'masculino') {
                        selectSexo.value = '1'; 
                    } else if (sexo === 'feminino') {
                        selectSexo.value = '2'; 
                    }

                    var modal = new bootstrap.Modal(document.getElementById('staticBackdropClienteEdit'));
                    modal.show();
                });
            });

            // FUNÇÃO CLICK BOTÃO DELETAR
            tabelaBody.querySelectorAll('.btn-deletar').forEach(function(button) {
                button.addEventListener('click', function() {
                    var clientId = button.closest('tr').getAttribute('data-cliente-id');
                    if (window.confirm('Tem certeza de que deseja deletar este cliente?')) {
                        deletarCliente(clientId);
                    }
                });
            });
        }
    })
    .catch(function(error) {
        console.error("Erro ao preencher tabela de clientes:", error);
    });
}

// FUNÇÕES EXECUTADAS QUANDO A PÁGINA CARREGA
document.addEventListener("DOMContentLoaded", function() {

    preencherTabelaClientes();

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
                    window.location.href = "../cadastrarCliente/cadastrarCliente.html";
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

    // FUNÇÃO CLICK BOTÃO SALVAR NOVA SENHA
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
                    window.location.href = "../cadastrarCliente/cadastrarCliente.html";
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
    
    // FUNÇÃO CLICK BOTÃO CADASTRAR CLIENTE
    document.getElementById("btnCadastarCliente").addEventListener("click", async function() { 

        var nomeCliente = document.getElementById("nomeCliente").value;
        var cpfCliente = document.getElementById("cpfCliente").value;
        var nascimentoCliente = document.getElementById("nascimentoCliente").value;
        var telefoneCliente = document.getElementById("telefoneCliente").value;
        var celularCliente = document.getElementById("celularCliente").value;
        var sexoCliente = document.getElementById("sexoCliente").value;

        if (sexoCliente === '2') {
            sexoCliente = 'feminino';
        } else {
            sexoCliente = 'masculino'; 
        }

        if (nomeCliente != '' && cpfCliente != '' && nascimentoCliente != '' && telefoneCliente != '' && celularCliente != '' && sexoCliente != '') {
            inserirCliente(nomeCliente, cpfCliente, nascimentoCliente, telefoneCliente, celularCliente, sexoCliente);
        } else {
            alert("Por favor. Preencha todos os campos!");
            return;
        }
    });

    // FUNÇÃO CLICK BOTÃO EDITAR CLIENTE
    document.getElementById("btnEditarCliente").addEventListener("click", async function() {
        var nomeEdit = document.getElementById("nomeClienteEdit").value;
        var cpfEdit = document.getElementById("cpfClienteEdit").value;
        var nascimentoEdit = document.getElementById("nascimentoClienteEdit").value;
        var telefoneEdit = document.getElementById("telefoneClienteEdit").value;
        var celularEdit = document.getElementById("celularClienteEdit").value;
        var sexoCliente = document.getElementById("sexoClienteEdit").value;
        var idCliente = document.getElementById("idClienteEdit").value;
    
        if(sexoCliente == '1') {
            sexoCliente = 'masculino';
        } else {
            sexoCliente = 'feminino';
        }
    
        try {
            var clienteCadastrado = alasql('SELECT * FROM clientes WHERE cpf = ? AND id <> ?', [cpfEdit, idCliente]);
    
            if (clienteCadastrado.length > 0) {
                alert("CPF já cadastrado. Por favor, insira um novo CPF.");
                return;
            } else {
                const sql = `UPDATE clientes SET nome = ?, cpf = ?, data_nascimento = ?, telefone = ?, celular = ?, sexo = ? WHERE id = ` + idCliente;
                alasql(sql, [nomeEdit, cpfEdit, nascimentoEdit , telefoneEdit, celularEdit, sexoCliente]);
            
                alert("Cliente atualizado com sucesso!");
                window.location.href = "../cadastrarCliente/cadastrarCliente.html";
                return;
            }
        } catch (error) {
            alert("Erro ao cadastrar cliente. Por favor, tente novamente.");
            return;
        }
    });

    // DEFININDO MÁSCARAS INPUTS
    $('#cpfCliente').inputmask('999.999.999-99');
    $('#telefoneCliente').inputmask('(99) 99999-9999');
    $('#celularCliente').inputmask('(99) 99999-9999');


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
