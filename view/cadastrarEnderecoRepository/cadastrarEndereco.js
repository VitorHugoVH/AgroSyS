// CADASTRAR NOVO ENDERECO
function inserirEndereco(cliente, cep , rua, bairro, cidade, estado, pais, principal) {
    try {
        var enderecosCliente = alasql('SELECT * FROM enderecos WHERE id_cliente = ' + cliente);

        if (enderecosCliente.length === 0) {
            alasql('INSERT INTO enderecos (cep, rua, bairro, cidade, estado, pais, id_cliente, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [cep, rua, bairro, cidade, estado, pais, cliente, principal]);
            
            alert("Endereço cadastrado com sucesso!");
            window.location.href = "../cadastrarEndereco/cadastrarEndereco.html";
        } else {
            var enderecosPrincipais = alasql('SELECT principal FROM enderecos WHERE id_cliente = '+ cliente +' AND principal = true');
            
            if (enderecosPrincipais.length > 0) {
                alert("Endereço principal já cadastrado para este cliente!");
            } else {
                alasql('INSERT INTO enderecos (cep, rua, bairro, cidade, estado, pais, id_cliente, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [cep, rua, bairro, cidade, estado, pais, cliente, principal]);
                
                alert("Endereço cadastrado com sucesso!");
                window.location.href = "../cadastrarEndereco/cadastrarEndereco.html";
            }
        }
    } catch (error) {
        alert("Erro ao cadastrar endereço. Por favor, tente novamente.");
    }
}

// DELETAR ENDEREÇO TABELA 
function deletarEndereco(enderecoId) {
    alasql.promise('DELETE FROM enderecos WHERE id = ' + enderecoId)
    .then(function () {
        var rowToRemove = document.querySelector(`tr[data-endereco-id="${enderecoId}"]`);
        rowToRemove.remove();
        alert("Endereço deletado com sucesso!");
    })
    .catch(function (error) {
        console.error("Erro ao deletar endereço:", error);
        alert("Erro ao deletar endereço. Por favor, tente novamente.");
    });
}

// FUNÇÃO PESQUISAR
document.getElementById("btnPesquisar").addEventListener("click", async function(){
    var termoPesquisa = document.getElementById("termoPesquisa").value;

    if(termoPesquisa != null) {
        preencherTabelaEndereco(termoPesquisa);
    }
});

function preencherTabelaEndereco(termoPesquisa) {
    var sql = 'SELECT * FROM enderecos';

    if (termoPesquisa) {
        sql = `SELECT * FROM enderecos WHERE cidade LIKE '%${termoPesquisa}%'`;
    }

    alasql.promise(sql)
    .then(function(enderecos) {
        var tabelaBody = document.getElementById('tabelaEnderecosBody');
        tabelaBody.innerHTML = ''; // Limpa os dados anteriores da tabela

        if (enderecos.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="8">Nenhum resultado encontrado</td></tr>';
        } else {
            enderecos.forEach(function(endereco) {
                var row = document.createElement('tr');
                row.setAttribute('data-endereco-id', endereco.id); // Adiciona um identificador único para cada linha

                row.innerHTML = `
                    <td style="white-space: nowrap;">${endereco.id}</td>
                    <td style="white-space: nowrap;">${endereco.cep}</td>
                    <td style="white-space: nowrap;">${endereco.rua}</td>
                    <td style="white-space: nowrap;">${endereco.bairro}</td>
                    <td style="white-space: nowrap;">${endereco.cidade}</td>
                    <td style="white-space: nowrap;">${endereco.estado}</td>
                    <td style="white-space: nowrap;">${endereco.pais}</td>
                    <td style="white-space: nowrap;">${endereco.id_cliente}</td>
                    <td style="white-space: nowrap;">${endereco.principal}</td>
                    <td style="white-space: nowrap;">
                        <button class="btn btn-danger btn-deletar"><i class="fas fa-trash"></i></button> 
                        <button class="btn btn-primary btn-editar"><i class="fas fa-edit"></i></button>
                        </td>
                `;
                tabelaBody.appendChild(row);
            });

            // Adiciona o manipulador de eventos para os botões "Editar"
            tabelaEnderecosBody.querySelectorAll('.btn-editar').forEach(function(button) {
                button.addEventListener('click', function() {
                    var row = button.closest('tr');
                    
                    var id = row.cells[0].textContent.trim();
                    var cep = row.cells[1].textContent.trim();
                    var rua = row.cells[2].textContent.trim();
                    var bairro = row.cells[3].textContent.trim();
                    var cidade = row.cells[4].textContent.trim();
                    var estado = row.cells[5].textContent.trim();
                    var pais = row.cells[6].textContent.trim();
                    var cliente = row.cells[7].textContent.trim();
                    var principal = row.cells[8].textContent.trim();
                    var checkbox = document.getElementById('principalEdit');
                    
                    if (principal === "true") {
                        checkbox.checked = true;
                    } else {
                        checkbox.checked = false;
                    }

                    console.log(principal);

                    // Preenche o modal com as informações do cliente
                    document.getElementById('idEdit').value = id;
                    document.getElementById('cepEdit').value = cep;
                    document.getElementById('ruaEdit').value = rua;
                    document.getElementById('bairroEdit').value = bairro;
                    document.getElementById('cidadeEdit').value = cidade;
                    document.getElementById('estadoEdit').value = estado;
                    document.getElementById('paisEdit').value = pais;
                    document.getElementById('clienteEdit').value = cliente;

                    // Abre o modal de edição
                    var modal = new bootstrap.Modal(document.getElementById('staticBackdropEnderecoEdit'));
                    modal.show();
                });
            });

            // Adiciona o manipulador de eventos para os botões "Deletar"
            tabelaBody.querySelectorAll('.btn-deletar').forEach(function(button) {
                button.addEventListener('click', function() {
                    var enderecoId = button.closest('tr').getAttribute('data-endereco-id');
                    if (window.confirm('Tem certeza de que deseja deletar este endereço?')) {
                        console.log(enderecoId);
                        deletarEndereco(enderecoId);
                    }
                });
            });
        }
    })
    .catch(function(error) {
        console.error("Erro ao preencher tabela de endereços:", error);
    });
}

// FUNÇÕES EXECUTADAS QUANDO A PÁGINA CARREGA
document.addEventListener("DOMContentLoaded", function() {

    preencherTabelaEndereco();

    document.getElementById("btnSalvarAlteracoes").addEventListener("click", async function() {
        var usuarioLogado = getCookie("usuarioLogado");

        if (usuarioLogado) {
            var usuario = JSON.parse(usuarioLogado);
            var senhaUsuario = document.getElementById("senhaUsuario").value;
            var novoEmail = document.getElementById("novoEmail").value;
            var idUsuario = usuario.id;

            console.log(idUsuario);

            if (verificarSenha(senhaUsuario, usuario.senha)) {
                if (novoEmail !== usuario.email) {
                    var sql = `UPDATE usuarios SET email = ? WHERE id = ?`;
                    console.log("SQL para atualização do email:", sql);
                
                    alasql(sql, [novoEmail, idUsuario]);
                
                    console.log("Email atualizado com sucesso no banco de dados!");
                
                    usuario.email = novoEmail;
                    document.cookie = `usuarioLogado=${JSON.stringify(usuario)}; path=/`;
                
                    alert("Email atualizado com sucesso!");
                    window.location.href = "../cadastrarEndereco/cadastrarEndereco.html";
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
                    window.location.href = "../cadastrarEndereco/cadastrarEndereco.html";
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
    
    document.getElementById("btnCadastarEndereco").addEventListener("click", async function() {
        var cep = document.getElementById("cep").value;
        var rua = document.getElementById("rua").value;
        var bairro = document.getElementById("bairro").value;
        var cidade = document.getElementById("cidade").value;
        var estado = document.getElementById("estado").value;
        var pais = document.getElementById("pais").value;
        var clienteId = document.getElementById("clienteAdd").value;
        var principal = document.getElementById("principal").checked;
    
        if (cep != '' && rua != '' && bairro != '' && cidade != '' && estado != '' && pais != '' && clienteId != '') {
            if (principal) {
                var enderecoPrincipal = alasql('SELECT * FROM enderecos WHERE id_cliente = ? AND principal = true', [clienteId]);
    
                if (enderecoPrincipal.length > 0) {
                    alert("Cliente já possui um endereço principal cadastrado!");
                    return;
                }
            }
            
            inserirEndereco(clienteId, cep, rua, bairro, cidade, estado, pais, principal);
        } else {
            alert("Por favor, preencha todos os campos!");
        }
    });    

    document.getElementById("btnEditarEndereco").addEventListener("click", async function() {
        var cepEdit = document.getElementById("cepEdit").value;
        var ruaEdit = document.getElementById("ruaEdit").value;
        var bairroEdit = document.getElementById("bairroEdit").value;
        var cidadeEdit = document.getElementById("cidadeEdit").value;
        var estadoEdit = document.getElementById("estadoEdit").value;
        var paisEdit = document.getElementById("paisEdit").value; 
        var clienteEdit = document.getElementById("clienteEdit").value; 
        var principalEdit = document.getElementById("principalEdit").checked;
        var idEdit = document.getElementById("idEdit").value;  
    
        if (principalEdit) {
            principalEdit = true;
            var enderecoPrincipal = alasql('SELECT * FROM enderecos WHERE id_cliente = ? AND principal = true', [clienteEdit]);
    
            if (enderecoPrincipal.length > 0) {
                alert("Cliente já possui um endereço principal cadastrado!");
                return;
            }
        } else {
            principalEdit = false;
        }
    
        const sql = `UPDATE enderecos SET cep = ?, rua = ?, bairro = ?, cidade = ?, estado = ?, pais = ?, id_cliente = ?, principal = ? WHERE id = ` + idEdit;
        console.log("SQL para atualização do cliente:", sql);
        alasql(sql, [cepEdit, ruaEdit, bairroEdit, cidadeEdit, estadoEdit, paisEdit, clienteEdit, principalEdit, idEdit]);
    
        alert("Endereco atualizado com sucesso!");
        window.location.href = "../cadastrarEndereco/cadastrarEndereco.html";
    });    

    // PREENCHER CAMPOS SELECT
    alasql.promise('SELECT id, nome FROM clientes')
    .then(function(clientes) {
        var selectClienteEdit = document.getElementById('clienteEdit');
        var selectClienteAdd = document.getElementById('clienteAdd');
        selectClienteEdit.innerHTML = '';
        selectClienteAdd.innerHTML = '';

        clientes.forEach(function(cliente) {
            var optionEdit = document.createElement('option');
            optionEdit.text = cliente.nome;
            optionEdit.value = cliente.id;
            selectClienteEdit.appendChild(optionEdit);

            var optionAdd = document.createElement('option');
            optionAdd.text = cliente.nome;
            optionAdd.value = cliente.id;
            selectClienteAdd.appendChild(optionAdd);
        });
    })
    .catch(function(error) {
        console.error("Erro ao recuperar nomes dos clientes:", error);
    });

    // DEFININDO MÁSCARAS INPUTS
    $('#cep').inputmask('99999-999');

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
