const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [cursos] = await pool.query("SELECT * FROM cursos ORDER BY nome");
    res.json(cursos);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao obter cursos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [cursos] = await pool.query("SELECT * FROM cursos WHERE id = ?", [id]);
    if (cursos.length === 0) {
      return res.status(404).json({ erro: "Curso não encontrado." });
    }
    const [disciplinas] = await pool.query(
      "SELECT * FROM disciplinas WHERE curso_id = ? ORDER BY ano",
      [id]
    );
    res.json({ ...cursos[0], disciplinas });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao obter curso." });
  }
});

module.exports = router;
