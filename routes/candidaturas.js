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
// ---------- ROTA TEMPORÁRIA: preparar estrutura da base de dados (apagar depois de usar!) ----------
router.post("/setup-temporario", async (req, res) => {
  try {
    await pool.query("ALTER TABLE candidaturas ADD COLUMN utilizador_id INT");
    await pool.query("ALTER TABLE candidaturas ADD FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id)");
    await pool.query(`
      CREATE TABLE posts_campanha (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidatura_id INT NOT NULL,
        titulo VARCHAR(150) NOT NULL,
        conteudo TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidatura_id) REFERENCES candidaturas(id)
      )
    `);
    res.json({ mensagem: "Estrutura da base de dados atualizada com sucesso!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao atualizar estrutura.", detalhes: erro.message });
  }
})
module.exports = router;
