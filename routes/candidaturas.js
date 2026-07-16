const express = require("express");
const pool = require("../config/db");
const { verificarToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [candidaturas] = await pool.query("SELECT * FROM candidaturas ORDER BY criado_em DESC");
    res.json(candidaturas);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao obter candidaturas." });
  }
});

router.post("/", verificarToken, async (req, res) => {
  try {
    const { nome_candidato, cargo, proposta } = req.body;
    if (!nome_candidato || !cargo) {
      return res.status(400).json({ erro: "Nome do candidato e cargo são obrigatórios." });
    }

    const [resultado] = await pool.query(
      "INSERT INTO candidaturas (nome_candidato, cargo, proposta) VALUES (?, ?, ?)",
      [nome_candidato, cargo, proposta || ""]
    );

    res.status(201).json({ mensagem: "Candidatura submetida com sucesso!", id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao submeter candidatura." });
  }
});

module.exports = router;
