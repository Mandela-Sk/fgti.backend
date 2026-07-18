// scripts/init-db.js
// Script de inicialização da base de dados — cria tabelas e insere dados iniciais
// Corre automaticamente antes do servidor arrancar (idempotente e seguro)

const mysql = require('mysql2/promise');
   console.log('DEBUG DB_HOST:', process.env.DB_HOST, '| DB_NAME:', process.env.DB_NAME);

const CREATE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS utilizadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    papel ENUM('estudante', 'docente', 'admin') NOT NULL DEFAULT 'estudante',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    duracao VARCHAR(50),
    saidas_profissionais TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    ano INT NOT NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS materiais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    curso_id INT NOT NULL,
    disciplina VARCHAR(200) NOT NULL,
    tipo ENUM('Sebenta', 'Exame', 'Exercícios', 'Outro') NOT NULL DEFAULT 'Sebenta',
    ficheiro_url VARCHAR(500),
    autor_id INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES utilizadores(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS noticias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    corpo TEXT,
    categoria ENUM('Faculdade', 'Núcleo') NOT NULL DEFAULT 'Faculdade',
    autor_id INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES utilizadores(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS candidaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_candidato VARCHAR(150) NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    proposta TEXT,
    utilizador_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE
  )`
,
  `CREATE TABLE IF NOT EXISTS votos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidatura_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidatura_id) REFERENCES candidaturas(id) ON DELETE CASCADE,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
    UNIQUE KEY voto_unico_por_cargo (utilizador_id, cargo)
  )`
,
  `CREATE TABLE IF NOT EXISTS posts_campanha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidatura_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidatura_id) REFERENCES candidaturas(id) ON DELETE CASCADE
  )`];

const CURSOS_SEED = [
  ['ti', 'Licenciatura em Tecnologias de Informação', '4 anos', 'Técnico Informático, Gestor de Redes, Técnico de Hardware'],
  ['gt', 'Licenciatura em Gestão de Turismo e Hotelaria', '4 anos', 'Gestor Hoteleiro, Operador Turístico, Guia Especializado'],
  ['ap', 'Licenciatura em Administração Pública', '4 anos', 'Técnico de Administração Pública, Gestor de Serviços Públicos'],
  ['ca', 'Licenciatura em Contabilidade e Auditoria', '4 anos', 'Contabilista, Auditor Interno/Financeiro'],
  ['dir', 'Licenciatura em Direito', '4 anos', 'Jurista, Consultor Jurídico'],
  ['eg', 'Licenciatura em Economia e Gestão', '4 anos', 'Analista Económico, Gestor Financeiro'],
  ['grh', 'Licenciatura em Gestão de Recursos Humanos', '4 anos', 'Técnico de RH, Gestor de Talento'],
  ['gmarn', 'Licenciatura em Gestão do Meio Ambiente e dos Recursos Naturais', '4 anos', 'Técnico Ambiental, Consultor de Sustentabilidade'],
  ['gae', 'Licenciatura em Gestão e Administração Educacional', '4 anos', 'Gestor Escolar, Técnico de Administração Educacional'],
  ['ppe', 'Licenciatura em Psicopedagogia e Ensino de Empreendedorismo', '4 anos', 'Psicopedagogo, Formador em Empreendedorismo']
];

const DISCIPLINAS_SEED = [
  [1, 'Fundamentos de Tecnologias de Informação', 1],
  [1, 'Programação I', 1],
  [1, 'Estruturas de Dados e Algoritmos', 2],
  [1, 'Base de Dados', 2],
  [1, 'Redes de Computadores', 3],
  [1, 'Sistemas Operativos', 3],
  [1, 'Inteligência Artificial', 4],
  [2, 'Introdução ao Turismo', 1],
  [2, 'Geografia do Turismo', 1],
  [2, 'Gestão Hoteleira', 2],
  [2, 'Marketing Turístico', 3]
];

const NOTICIAS_SEED = [
  ['Eleições do Núcleo de Estudantes 2026 abertas', 'Está aberto o processo de candidaturas para a direcção do Núcleo de Estudantes da FGTI.', 'Núcleo']
];

async function initDb() {
  console.log('🔧 A conectar à base de dados...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('✅ Conectado! A criar tabelas...');

  for (const statement of CREATE_STATEMENTS) {
    await connection.query(statement);
  }
  console.log('✅ Tabelas criadas/verificadas.');

  const [cursosRows] = await connection.query('SELECT COUNT(*) as total FROM cursos');
  if (cursosRows[0].total === 0) {
    console.log('🌱 A inserir dados iniciais (cursos, disciplinas, notícias)...');

    for (const curso of CURSOS_SEED) {
      await connection.query(
        'INSERT INTO cursos (codigo, nome, duracao, saidas_profissionais) VALUES (?, ?, ?, ?)',
        curso
      );
    }

    for (const disciplina of DISCIPLINAS_SEED) {
      await connection.query(
        'INSERT INTO disciplinas (curso_id, nome, ano) VALUES (?, ?, ?)',
        disciplina
      );
    }

    for (const noticia of NOTICIAS_SEED) {
      await connection.query(
        'INSERT INTO noticias (titulo, corpo, categoria) VALUES (?, ?, ?)',
        noticia
      );
    }

    console.log('✅ Dados iniciais inseridos com sucesso.');
  } else {
    console.log('ℹ️ Dados iniciais já existem, a saltar inserção.');
  }

  await connection.end();
  console.log('🎉 Base de dados pronta!');
}

initDb().catch((err) => {
  console.error('❌ Erro ao inicializar a base de dados:', err);
  process.exit(1);
});
