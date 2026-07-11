const express = require("express");
const pool = require("../config/db");
const { verificarToken } = require("../middleware/auth");

const router = express.Router();

// Submeter um voto (exige login)
router.post("/", verificarToken, async (req, res) => {
  try {
    const { candidatura_id } = req.body;
    if (!candidatura_id) {
      return res.status(400).json({ erro: "candidatura_id é obrigatório." });
    }

    const [candidaturas] = await pool.query(
      "SELECT * FROM candidaturas WHERE id = ?",
      [candidatura_id]
    );
    if (candidaturas.length === 0) {
      return res.status(404).json({ erro: "Candidatura não encontrada." });
    }

    const cargo = candidaturas[0].cargo;
    const utilizador_id = req.utilizador.id;

    try {
      await pool.query(
        "INSERT INTO votos (candidatura_id, utilizador_id, cargo) VALUES (?, ?, ?)",
        [candidatura_id, utilizador_id, cargo]
      );
    } catch (erroInsercao) {
      if (erroInsercao.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ erro: "Já votaste para este cargo." });
      }
      throw erroInsercao;
    }

    res.status(201).json({ mensagem: "Voto registado com sucesso!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro no servidor ao registar voto." });
  }
});

// Ver resultados (público)
router.get("/resultados", async (req, res) => {
  try {
    const [resultados] = await pool.query(`
      SELECT c.id, c.nome_candidato, c.cargo,
             COUNT(v.id) AS total_votos
      FROM candidaturas c
      LEFT JOIN votos v ON v.candidatura_id = c.id
      GROUP BY c.id, c.nome_candidato, c.cargo
      ORDER BY c.cargo, total_votos DESC
    `);
    res.json(resultados);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao obter resultados." });
  }
});

module.exports = router;
