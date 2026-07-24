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
// ---------- Publicar post de campanha (só o dono da candidatura) ----------
router.post("/:id/posts", verificarToken, async (req, res) => {
  try {
    const candidatura_id = req.params.id;
    const { titulo, conteudo } = req.body;

    if (!titulo || !conteudo) {
      return res.status(400).json({ erro: "Título e conteúdo são obrigatórios." });
    }

    const [candidaturas] = await pool.query(
      "SELECT * FROM candidaturas WHERE id = ?",
      [candidatura_id]
    );
    if (candidaturas.length === 0) {
      return res.status(404).json({ erro: "Candidatura não encontrada." });
    }

    if (candidaturas[0].utilizador_id !== req.utilizador.id) {
      return res.status(403).json({ erro: "Só o dono da candidatura pode publicar aqui." });
    }

    const [resultado] = await pool.query(
      "INSERT INTO posts_campanha (candidatura_id, titulo, conteudo) VALUES (?, ?, ?)",
      [candidatura_id, titulo, conteudo]
    );

    res.status(201).json({ mensagem: "Post publicado com sucesso!", id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao publicar post." });
  }
});

// ---------- Ver posts de campanha de uma candidatura (público) ----------
router.get("/:id/posts", async (req, res) => {
  try {
    const candidatura_id = req.params.id;
    const [posts] = await pool.query(
      "SELECT * FROM posts_campanha WHERE candidatura_id = ? ORDER BY criado_em DESC",
      [candidatura_id]
    );
    res.json(posts);
  
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao obter posts." });
}
      });

// ---------- Remover candidatura (só o dono) ----------
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const candidatura_id = req.params.id;

    const [candidaturas] = await pool.query(
      "SELECT * FROM candidaturas WHERE id = ?",
      [candidatura_id]
    );
    if (candidaturas.length === 0) {
      return res.status(404).json({ erro: "Candidatura não encontrada." });
    }

    if (candidaturas[0].utilizador_id !== req.utilizador.id) {
      return res.status(403).json({ erro: "Só o dono da candidatura pode removê-la." });
    }

    await pool.query("DELETE FROM candidaturas WHERE id = ?", [candidatura_id]);
    res.json({ mensagem: "Candidatura removida com sucesso!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao remover candidatura." });
  }
});

module.exports = router;
