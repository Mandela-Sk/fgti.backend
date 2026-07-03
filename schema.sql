-- ============================================================
-- ESQUEMA DA BASE DE DADOS — Micro-site FGTI (UCM Pemba)
-- ============================================================

CREATE DATABASE IF NOT EXISTS fgti_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fgti_db;

CREATE TABLE IF NOT EXISTS utilizadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  papel ENUM('estudante', 'docente', 'admin') NOT NULL DEFAULT 'estudante',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(200) NOT NULL,
  duracao VARCHAR(50),
  saidas_profissionais TEXT
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  nome VARCHAR(200) NOT NULL,
  ano INT NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materiais (
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
);

CREATE TABLE IF NOT EXISTS noticias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  corpo TEXT,
  categoria ENUM('Faculdade', 'Núcleo') NOT NULL DEFAULT 'Faculdade',
  autor_id INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES utilizadores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS candidaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_candidato VARCHAR(150) NOT NULL,
  cargo VARCHAR(150) NOT NULL,
  proposta TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cursos (codigo, nome, duracao, saidas_profissionais) VALUES
('ti',    'Licenciatura em Tecnologias de Informação', '4 anos', 'Técnico Informático, Gestor de Redes, Técnico de Hardware'),
('gt',    'Licenciatura em Gestão de Turismo e Hotelaria', '4 anos', 'Gestor Hoteleiro, Operador Turístico, Guia Especializado'),
('ap',    'Licenciatura em Administração Pública', '4 anos', 'Técnico de Administração Pública, Gestor de Serviços Públicos'),
('ca',    'Licenciatura em Contabilidade e Auditoria', '4 anos', 'Contabilista, Auditor Interno/Financeiro'),
('dir',   'Licenciatura em Direito', '4 anos', 'Jurista, Consultor Jurídico'),
('eg',    'Licenciatura em Economia e Gestão', '4 anos', 'Analista Económico, Gestor Financeiro'),
('grh',   'Licenciatura em Gestão de Recursos Humanos', '4 anos', 'Técnico de RH, Gestor de Talento'),
('gmarn', 'Licenciatura em Gestão do Meio Ambiente e dos Recursos Naturais', '4 anos', 'Técnico Ambiental, Consultor de Sustentabilidade'),
('gae',   'Licenciatura em Gestão e Administração Educacional', '4 anos', 'Gestor Escolar, Técnico de Administração Educacional'),
('ppe',   'Licenciatura em Psicopedagogia e Ensino de Empreendedorismo', '4 anos', 'Psicopedagogo, Formador em Empreendedorismo');

INSERT INTO disciplinas (curso_id, nome, ano) VALUES
(1, 'Fundamentos de Tecnologias de Informação', 1),
(1, 'Programação I', 1),
(1, 'Estruturas de Dados e Algoritmos', 2),
(1, 'Base de Dados', 2),
(1, 'Redes de Computadores', 3),
(1, 'Sistemas Operativos', 3),
(1, 'Inteligência Artificial', 4),
(2, 'Introdução ao Turismo', 1),
(2, 'Geografia do Turismo', 1),
(2, 'Gestão Hoteleira', 2),
(2, 'Marketing Turístico', 3);

INSERT INTO noticias (titulo, corpo, categoria) VALUES
('Eleições do Núcleo de Estudantes 2026 abertas', 'Está aberto o processo de candidaturas para a direcção do Núcleo de Estudantes da FGTI.', 'Núcleo');
