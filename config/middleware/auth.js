const jwt = require("jsonwebtoken");
require("dotenv").config();

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido. Faz login primeiro." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const dadosUtilizador = jwt.verify(token, process.env.JWT_SECRET);
    req.utilizador = dadosUtilizador;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

function apenasDocenteOuAdmin(req, res, next) {
  if (req.utilizador.papel !== "admin" && req.utilizador.papel !== "docente") {
    return res.status(403).json({ erro: "Não tens permissão para esta acção." });
  }
  next();
}

module.exports = { verificarToken, apenasDocenteOuAdmin };
