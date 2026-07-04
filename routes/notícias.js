const express = require("express");
const pool = require("../config/db");
const { verificarToken, apenasDocenteOuAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { categoria } = req.query;
    let sql = "SELECT * FROM noticias";
    const valores = [];

    if (categoria) {
      sql += " WHERE categoria = ?";
      valores.push(categoria);
    }
    sql += " ORDER BY criado_em DESC";

    const [noticias] = await pool.query(sql, valores);
    res.json(noticias);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao obter notícias." });
  }
});

router.post("/", verificarToken, apenasDocenteOuAdmin, async (req, res) => {
  try {
    const { titulo, corpo, categoria } = req.body;
    if (!titulo) {
      return res.status(400).json({ erro: "O título é obrigatório." });
    }

    const [resultado] = await pool.query(
      "INSERT INTO noticias (titulo, corpo, categoria, autor_id) VALUES (?, ?, ?, ?)",
      [titulo, corpo || "", categoria || "Faculdade", req.utilizador.id]
    );

    res.status(201).json({ mensagem: "Notícia publicada!", id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao publicar notícia." });
  }
});

module.exports = router;
