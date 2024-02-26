// FUNÇÃO CRIPTOGRAFIA DE SENHA
function encryptPassword(password) {

    const salt = CryptoJS.lib.WordArray.random(16);
    const hash = CryptoJS.PBKDF2(password, salt, { keySize: 512/32, iterations: 1000 });
    const saltString = CryptoJS.enc.Base64.stringify(salt);
    const hashString = CryptoJS.enc.Base64.stringify(hash);
    return saltString + ":" + hashString;
}

// FUNÇÃO RECEBER ARQUIVO UPLOAD
function uploadDatabase() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const sqlContent = e.target.result;

            try {
                alasql('DROP TABLE IF EXISTS usuarios');
                alasql('DROP TABLE IF EXISTS clientes');
                alasql('DROP TABLE IF EXISTS enderecos');

                alasql(sqlContent);

                // CRIPTOGRAFIA DA SENHA USUÁRIO
                const usuarios = alasql('SELECT * FROM usuarios');
                usuarios.forEach(function(usuario) {
                    usuario.senha = encryptPassword(usuario.senha);
                    alasql('UPDATE usuarios SET senha = ? WHERE id = ' + usuario.id, [usuario.senha]);
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

// FUNÇÃO EXPORTAR BANCO DE DADOS (JSON)
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

        const blob = new Blob([databaseJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'banco_de_dados.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch(error) {
        alert("Banco de Dados não criado! Por Favor, faça o upload de um Banco de Dados.");
        window.location.href = "../config/configuracoes.html";
    }
}

// FUNÇÕES EXECUTADAS QUANDO A PÁGINA CARREGA
document.addEventListener("DOMContentLoaded", function() {

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

    // FUNÇÃO CLICK BOTÃO EXPORTAR
    document.getElementById("exportBtn").addEventListener("click", function(event) {
        event.preventDefault();
        exportDatabase();
    });
});
