import express from "express";
import cors from "cors";
import { setupSwagger } from "./config/swagger";
import userRoutes from "./infrastructure/web/routes/user.routes";

const app = express();

// ==========================================
// MIDDLEWARES DE SEGURANÇA E PARSING
// ==========================================

// O CORS define quem pode "chamar" sua API.
// Por enquanto, liberamos para qualquer origem, mas em produção você deve restringir.
app.use(cors());

// Permite que o Express entenda JSON no corpo (body) das requisições
app.use(express.json());

// ==========================================
// DOCUMENTAÇÃO
// ==========================================
setupSwagger(app);

// ==========================================
// ROTAS DA APLICAÇÃO
// ==========================================
app.use("/api/users", userRoutes);

// Rota de Health Check (Segurança: ajuda a monitorar se o servidor está vivo)
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

export default app;
