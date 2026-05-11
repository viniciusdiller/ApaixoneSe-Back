import dotenv from "dotenv";
import app from "./app";

// Carrega as variáveis do arquivo .env (como a porta e a URL do banco)
dotenv.config();

const PORT = process.env.PORT;

// Liga o servidor
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor ApaixoneSe rodando!
  📡 Porta: ${PORT}
  🌐 Ambiente: ${process.env.NODE_ENV || "development"}
  📄 Swagger: http://localhost:${PORT}/api-docs
  `);
});
