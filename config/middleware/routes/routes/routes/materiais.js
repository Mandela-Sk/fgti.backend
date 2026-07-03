const express = require("express");
const pool = require("../config/db");
const { verificarToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { curso_id, busca } = req.query;

    let sql = `
      SELECT m.*, c.nome AS curso_nome, u.nome AS autor_nome
      FROM materiais m
      JOIN cursos c ON m.curso_id = c.id
      LEFT JOIN utilizadores u ON m.autor_id = u.id
      WHERE 1=1
    `;
    const valores = [];

    if (curso_id) {
      sql += " AND m.curso_id = ?";
      valores.push(curso_id);
    }
    if (busca) {
      sql += " AND (m.titulo LIKE ? OR m.disciplina LIKE ?)";
      valores.push(`%${busca}%`, `%${busca}%`);
    }

    sql += " ORDER BY m.criado_em DESC";

    const [materiais] = await pool.query(sql, valores);
    res.json(materiais);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao obter materiais." });
  }
});

router.post("/", verificarToken, async (req, res) => {
  try {
    const { titulo, curso_id, disciplina, tipo, ficheiro_url } = req.body;

    if (!titulo || !curso_id || !disciplina) {
      return res.status(400).json({ erro: "Título, curso e disciplina são obrigatórios." });
    }

    const [resultado] = await pool.query(
      "INSERT INTO materiais (titulo, curso_id, disciplina, tipo, ficheiro_url, autor_id) VALUES (?, ?, ?, ?, ?, ?)",
      [titulo, curso_id, disciplina, tipo || "Sebenta", ficheiro_url || null, req.utilizador.id]
    );

    res.status(201).json({ mensagem: "Material publicado com sucesso!", id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao publicar material." });
  }
});

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [materiais] = await pool.query("SELECT * FROM materiais WHERE id = ?", [id]);

    if (materiais.length === 0) {
      return res.status(404).json({ erro: "Material não encontrado." });
    }

    const material = materiais[0];
    const podeApagar = material.autor_id === req.utilizador.id || req.utilizador.papel === "admin";

    if (!podeApagar) {
      return res.status(403).json({ erro: "Só o autor ou um admin pode remover este material." });
    }

    await pool.query("DELETE FROM materiais WHERE id = ?", [id]);
    res.json({ mensagem: "Material removido com sucesso." });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao remover material." });
  }
});

module.exports = router;
