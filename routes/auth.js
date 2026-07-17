const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const router = express.Router();

router.post("/registo", async (req, res) => {
  try {
    const { nome, email, password, papel } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({ erro: "Nome, email e password são obrigatórios." });
    }
if (!email.endsWith("@ucm.ac.mz")) {
      return res.status(400).json({ erro: "Regista-te com o teu email institucional (@ucm.ac.mz)." });
    }
    const [existentes] = await pool.query("SELECT id FROM utilizadores WHERE email = ?", [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: "Já existe uma conta com este email." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [resultado] = await pool.query(
      "INSERT INTO utilizadores (nome, email, password_hash, papel) VALUES (?, ?, ?, ?)",
      [nome, email, passwordHash, papel || "estudante"]
    );

    res.status(201).json({ mensagem: "Conta criada com sucesso!", id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro no servidor ao criar conta." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: "Email e password são obrigatórios." });
    }

    const [utilizadores] = await pool.query("SELECT * FROM utilizadores WHERE email = ?", [email]);
    if (utilizadores.length === 0) {
      return res.status(401).json({ erro: "Email ou password incorrectos." });
    }

    const utilizador = utilizadores[0];
    const passwordCorreta = await bcrypt.compare(password, utilizador.password_hash);

    if (!passwordCorreta) {
      return res.status(401).json({ erro: "Email ou password incorrectos." });
    }

    const token = jwt.sign(
      { id: utilizador.id, nome: utilizador.nome, papel: utilizador.papel },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      mensagem: "Login efectuado com sucesso!",
      token,
      utilizador: { id: utilizador.id, nome: utilizador.nome, email: utilizador.email, papel: utilizador.papel },
    });
  } catch (erro) {
    console.error(erro);
      res.status(500).json({ erro: "Erro no servidor ao fazer login." });
  }
});
// ---------- ROTA TEMPORÁRIA: redefinir password (apagar depois de usar!) ----------
router.put("/redefinir-password-temporario", async (req, res) => {
  try {
    const { email, nova_password } = req.body;
    if (!email || !nova_password) {
      return res.status(400).json({ erro: "email e nova_password são obrigatórios." });
    }
    const novaHash = await bcrypt.hash(nova_password, 10);
    await pool.query("UPDATE utilizadores SET password_hash = ? WHERE email = ?", [novaHash, email]);
    res.json({ mensagem: "Password redefinida com sucesso!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao redefinir password." });
  }
});

module.exports = router;
