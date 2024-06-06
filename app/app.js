const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Inicializando o banco de dados e criando tabelas
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
  db.run(`CREATE TABLE IF NOT EXISTS Bibliotecario (
            NomeBibliotecario TEXT,
            CPFBibliotecario TEXT PRIMARY KEY,
            Email TEXT,
            Usuario TEXT,
            Senha TEXT
        )`);
  db.run(`CREATE TABLE IF NOT EXISTS Livro (
            CodigoLivro INTEGER PRIMARY KEY,
            NomeLivro TEXT,
            Autor TEXT,
            Editora TEXT,
            Ano INTEGER,
            Categoria TEXT,
            ImagemLivro TEXT,
            DataReserva TEXT,
            DataDevolucao TEXT,
            Status TEXT,
            CPFAluno TEXT REFERENCES FichaAluno(CPFAluno)
        )`);
  db.run(`CREATE TABLE IF NOT EXISTS FichaAluno (
            NomeAluno TEXT,
            Email TEXT,
            Telefone TEXT,
            Matricula TEXT,
            CPFAluno TEXT PRIMARY KEY,
            CodigoLivro INTEGER REFERENCES Livro(CodigoLivro)
        )`);
});

// Configurar o middleware body-parser
app.use(bodyParser.json());

// Função para criar conta de bibliotecário
app.post('/bibliotecarios', (req, res) => {
  const { nome, cpf, email, usuario, senha } = req.body;
  db.run('INSERT INTO Bibliotecario (NomeBibliotecario, CPFBibliotecario, Email, Usuario, Senha) VALUES (?, ?, ?, ?, ?)', [nome, cpf, email, usuario, senha], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao criar conta de bibliotecário');
    } else {
      res.status(201).send('Conta de bibliotecário criada com sucesso');
    }
  });
});

// Função para fazer login de bibliotecário
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  db.get('SELECT * FROM Bibliotecario WHERE Email = ? AND Senha = ?', [email, senha], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao fazer login');
    } else if (!row) {
      res.status(401).send('Credenciais inválidas');
    } else {
      res.status(200).json(row);
    }
  });
});

// Função para criar ficha de aluno
app.post('/alunos', (req, res) => {
  const { nome, email, telefone, matricula, cpf, codigoLivro } = req.body;
  db.run('INSERT INTO FichaAluno (NomeAluno, Email, Telefone, Matricula, CPFAluno, CodigoLivro) VALUES (?, ?, ?, ?, ?, ?)', [nome, email, telefone, matricula, cpf, codigoLivro], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao criar ficha de aluno');
    } else {
      res.status(201).send('Ficha de aluno criada com sucesso');
    }
  });
});


// Rota para a raiz do servidor
app.get('/', (req, res) => {
    res.send('Bem-vindo ao sistema de gestão de livros e empréstimos!');
  });

// Função para consultar aluno por CPF
app.get('/alunos/:cpf', (req, res) => {
  const { cpf } = req.params;
  db.get('SELECT * FROM FichaAluno WHERE CPFAluno = ?', [cpf], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao consultar aluno');
    } else if (!row) {
      res.status(404).send('Aluno não encontrado');
    } else {
      res.status(200).json(row);
    }
  });
});

app.get('/bibliotecarios/:cpf', (req, res) => {
  const { cpf } = req.params;
  db.get('SELECT * FROM Bibliotecario WHERE CPFBibliotecario = ?', [cpf], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao consultar bibliotecário');
    } else if (!row) {
      res.status(404).send('Bibliotecário não encontrado');
    } else {
      res.status(200).json(row);
    }
  });
});


// Função para pesquisar livro pelo código
app.get('/livros/:codigo', (req, res) => {
  const { codigo } = req.params;
  db.get('SELECT * FROM Livro WHERE CodigoLivro = ?', [codigo], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao pesquisar livro');
    } else if (!row) {
      res.status(404).send('Livro não encontrado');
    } else {
      res.status(200).json(row);
    }
  });
});

// Função para cadastrar livro
app.post('/livros', (req, res) => {
  const { nome, autor, editora, ano, categoria, imagemLivro, dataReserva, dataDevolucao, status, cpfAluno } = req.body;
  db.run('INSERT INTO Livro (NomeLivro, Autor, Editora, Ano, Categoria, ImagemLivro, DataReserva, DataDevolucao, Status, CPFAluno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nome, autor, editora, ano, categoria, imagemLivro, dataReserva, dataDevolucao, status, cpfAluno], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao cadastrar livro');
    } else {
      res.status(201).send('Livro cadastrado com sucesso');
    }
  });
});

// Função para atualizar cadastro de livro
app.put('/livros/:codigo', (req, res) => {
  const { nome, autor, editora, ano, categoria, imagemLivro, dataReserva, dataDevolucao, status, cpfAluno } = req.body;
  const { codigo } = req.params;
  db.run('UPDATE Livro SET NomeLivro = ?, Autor = ?, Editora = ?, Ano = ?, Categoria = ?, ImagemLivro = ?, DataReserva = ?, DataDevolucao = ?, Status = ?, CPFAluno = ? WHERE CodigoLivro = ?', [nome, autor, editora, ano, categoria, imagemLivro, dataReserva, dataDevolucao, status, cpfAluno, codigo], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao atualizar cadastro de livro');
    } else {
      res.status(200).send('Cadastro de livro atualizado com sucesso');
    }
  });
});

// Função para apagar cadastro de livro
app.delete('/livros/:codigo', (req, res) => {
  const { codigo } = req.params;
  db.run('DELETE FROM Livro WHERE CodigoLivro = ?', [codigo], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao apagar cadastro de livro');
    } else {
      res.status(200).send('Cadastro de livro apagado com sucesso');
    }
  });
});

// Função para consultar pendências de livros
app.get('/pendencias', (req, res) => {
  db.all('SELECT Livro.NomeLivro, Livro.CodigoLivro, FichaAluno.NomeAluno, FichaAluno.CPFAluno, FichaAluno.Telefone FROM Livro INNER JOIN FichaAluno ON Livro.CPFAluno = FichaAluno.CPFAluno', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao consultar pendências de livros');
    } else {
      res.status(200).json(rows);
    }
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
