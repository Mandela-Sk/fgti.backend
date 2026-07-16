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
    const { cargo, proposta } = req.body;
    const nome_candidato = req.utilizador.nome;
    const utilizador_id = req.utilizador.id;

    if (!cargo) {
      return res.status(400).json({ erro: "O cargo é obrigatório." });
    }

    const [resultado] = await pool.query(
      "INSERT INTO candidaturas (nome_candidato, cargo, proposta, utilizador_id) VALUES (?, ?, ?, ?)",
      [nome_candidato, cargo, proposta || "", utilizador_id]
    );
    res.status(201).json({ mensagem: "Candidatura submetida com sucesso!", id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao submeter candidatura." });
  }
});

module.exports = router;
