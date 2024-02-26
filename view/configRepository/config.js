function encryptPassword(password) {

    console.log(password);

    const salt = CryptoJS.lib.WordArray.random(16);
    const hash = CryptoJS.PBKDF2(password, salt, { keySize: 512/32, iterations: 1000 });
    const saltString = CryptoJS.enc.Base64.stringify(salt);
    const hashString = CryptoJS.enc.Base64.stringify(hash);
    return saltString + ":" + hashString;
}

function uploadDatabase() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const sqlContent = e.target.result;

            try {
                // Apagar todas as tabelas existentes
                alasql('DROP TABLE IF EXISTS usuarios');
                alasql('DROP TABLE IF EXISTS clientes');
                alasql('DROP TABLE IF EXISTS enderecos');

                // Executar os comandos SQL do arquivo
                alasql(sqlContent);

            // Criptografar as senhas dos usuários
            const usuarios = alasql('SELECT * FROM usuarios');
            usuarios.forEach(function(usuario) {
                usuario.senha = encryptPassword(usuario.senha);
                // Atualizar a senha no banco de dados
                alasql('UPDATE usuarios SET senha = ? WHERE id = ' + usuario.id, [usuario.senha]);
                console.log("Senha atualizada para o usuário com ID " + usuario.id);
            });

                alert('Banco de dados enviado com sucesso!');
                window.location.href = "../config/configuracoes.html";
            } catch(error) {
                console.error('Erro ao carregar banco de dados:', error);
            }
        }
        reader.readAsText(file);
    } else {
        alert('Por favor, selecione um arquivo.');
    }
}

// Função para exportar o banco de dados no formato JSON
function exportDatabase() {
    try {
        const usuarios = alasql('SELECT * FROM usuarios');
        const clientes = alasql('SELECT * FROM clientes');
        const enderecos = alasql('SELECT * FROM enderecos');

        const database = {
            usuarios: usuarios,
            clientes: clientes,
            enderecos: enderecos
        };

        const databaseJSON = JSON.stringify(database);

        // Criar um link de download para o arquivo JSON
        const blob = new Blob([databaseJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'banco_de_dados.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Banco de dados exportado com sucesso!');
    } catch(error) {
        console.error('Erro ao exportar banco de dados:', error);
    }
}

document.addEventListener("DOMContentLoaded", function() {

    listarInformacoesTabelas();

    const prepopulatedDatabase = localStorage.getItem('prepopulatedDatabase');
    if (prepopulatedDatabase) {
        alasql(prepopulatedDatabase)
            .then(function() {
                console.log('Banco de dados pré-populado carregado com sucesso!');
            })
            .catch(function(error) {
                console.error('Erro ao carregar banco de dados pré-populado:', error);
            });
    }

    var enviarBtn = document.getElementById("enviarBtn");

    enviarBtn.addEventListener("click", function(event) {
        event.preventDefault();

        uploadDatabase();
    });

    // Adicionar um event listener para o botão de exportar
    document.getElementById("exportBtn").addEventListener("click", function(event) {
        event.preventDefault();
        exportDatabase();
    });
});
