const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const cursosRoutes = require("./routes/cursos");
const materiaisRoutes = require("./routes/materiais");
const noticiasRoutes = require("./routes/noticias");
const candidaturasRoutes = require("./routes/candidaturas");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API do micro-site da FGTI está a funcionar! 🌊" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/materiais", materiaisRoutes);
app.use("/api/noticias", noticiasRoutes);
app.use("/api/candidaturas", candidaturasRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor a correr em http://localhost:${PORT}`);
});
